import os
from urllib.parse import quote_plus
from sqlalchemy import inspect

from sqlmodel import create_engine, Session, SQLModel, select

password = quote_plus("jiya@123")
DATABASE_URL = f"mysql+pymysql://root:{password}@localhost:3306/myntra"

# Fallback to SQLite if MySQL connection fails
try:
    engine = create_engine(DATABASE_URL, echo=True)
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"⚠️ MySQL connection failed: {e}. Falling back to SQLite.")
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "myntra.db"))
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

# Ensure all models are registered
import app.models.OutfitCircleSchema
import app.models.FestivalSchema
import app.models.LocalBazaarSchema

# Create tables
SQLModel.metadata.create_all(engine)


def ensure_board_member_invite_columns():
    try:
        inspector = inspect(engine)
        if inspector.has_table("board_members"):
            columns = {col["name"] for col in inspector.get_columns("board_members")}

            with engine.begin() as conn:
                if "invite_status" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE board_members ADD COLUMN invite_status VARCHAR(20) NOT NULL DEFAULT "accepted"'
                    )
                if "accepted_at" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE board_members ADD COLUMN accepted_at DATETIME NULL'
                    )

                conn.exec_driver_sql(
                    'UPDATE board_members SET invite_status = "accepted" WHERE invite_status IS NULL'
                )
    except Exception as exc:
        print(f"⚠️ Board member invite-column migration skipped: {exc}")


def ensure_user_city_column():
    try:
        inspector = inspect(engine)
        if inspector.has_table("users"):
            columns = {col["name"] for col in inspector.get_columns("users")}

            with engine.begin() as conn:
                if "city" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE users ADD COLUMN city VARCHAR(100) NULL'
                    )

                conn.exec_driver_sql(
                    'UPDATE users SET city = "Delhi" WHERE city IS NULL AND username = "testuser"'
                )
    except Exception as exc:
        print(f"⚠️ User city-column migration skipped: {exc}")


ensure_board_member_invite_columns()
ensure_user_city_column()


def ensure_reimagined_columns():
    try:
        inspector = inspect(engine)

        # 1. Update outfit_boards table
        if inspector.has_table("outfit_boards"):
            columns = {col["name"] for col in inspector.get_columns("outfit_boards")}
            with engine.begin() as conn:
                if "circle_type" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE outfit_boards ADD COLUMN circle_type VARCHAR(20) NOT NULL DEFAULT "classic"'
                    )
                if "city" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE outfit_boards ADD COLUMN city VARCHAR(100) NULL'
                    )
                if "description" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE outfit_boards ADD COLUMN description VARCHAR(255) NULL'
                    )
                if "creator_avatar_url" not in columns:
                    conn.exec_driver_sql(
                        'ALTER TABLE outfit_boards ADD COLUMN creator_avatar_url TEXT NULL'
                    )

        # 2. Update pinned_products table
        if inspector.has_table("pinned_products"):
            columns = {col["name"] for col in inspector.get_columns("pinned_products")}
            with engine.begin() as conn:
                # Sizing/Fit/Voice
                if "fit_video_url" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_video_url TEXT NULL')
                if "fit_review_text" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_review_text TEXT NULL')
                if "fit_height" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_height FLOAT NULL')
                if "fit_weight" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_weight FLOAT NULL')
                if "fit_size_purchased" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_size_purchased VARCHAR(20) NULL')
                if "fit_audio_review_url" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_audio_review_url TEXT NULL')
                if "fit_feedback_badges" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN fit_feedback_badges VARCHAR(255) NULL')

                # Local Bazaar / Group buy
                if "group_buy_eligible" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN group_buy_eligible BOOLEAN NOT NULL DEFAULT 0')
                if "group_buy_discount_rate" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN group_buy_discount_rate FLOAT NULL DEFAULT 0.0')
                if "min_orders_required" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN min_orders_required INTEGER NULL DEFAULT 3')
                if "is_local_bazaar_item" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN is_local_bazaar_item BOOLEAN NOT NULL DEFAULT 0')
                if "bazaar_shop_name" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN bazaar_shop_name VARCHAR(255) NULL')

                # Canvas layouts
                if "canvas_x" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN canvas_x FLOAT NULL')
                if "canvas_y" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN canvas_y FLOAT NULL')
                if "canvas_scale" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN canvas_scale FLOAT NULL')
                if "canvas_z_index" not in columns:
                    conn.exec_driver_sql('ALTER TABLE pinned_products ADD COLUMN canvas_z_index INTEGER NULL')
    except Exception as exc:
        print(f"⚠️ Reimagined outfit circle column migration failed: {exc}")


ensure_reimagined_columns()


# Seed database if empty
def seed_database():
    from app.models.FestivalSchema import Festival, FestivalBoostRule, Category
    from datetime import date
    from decimal import Decimal
    
    with Session(engine) as session:
        # Check if Category is empty
        if len(session.exec(select(Category)).all()) == 0:
            print("🌱 Seeding database categories...")
            c1 = Category(category_id=1, category_name="Men Ethnic Wear")
            c2 = Category(category_id=2, category_name="Women Ethnic Wear")
            c3 = Category(category_id=3, category_name="Rakhi")
            c4 = Category(category_id=4, category_name="Jewellery")
            c5 = Category(category_id=5, category_name="Gifts")
            session.add_all([c1, c2, c3, c4, c5])
            session.commit()
            
        # Check if Festival is empty
        if len(session.exec(select(Festival)).all()) == 0:
            print("🌱 Seeding active National & Regional festivals...")
            festivals = [
                Festival(
                    festival_id=1,
                    name="Raksha Bandhan",
                    region_tags=["All"],
                    start_date=date(2026, 8, 1),
                    end_date=date(2026, 8, 31),
                    is_active=True
                ),
                Festival(
                    festival_id=2,
                    name="Diwali",
                    region_tags=["All"],
                    start_date=date(2026, 10, 20),
                    end_date=date(2026, 11, 20),
                    is_active=True
                ),
                Festival(
                    festival_id=3,
                    name="Chhath Puja",
                    region_tags=["Patna"],
                    start_date=date(2026, 11, 1),
                    end_date=date(2026, 11, 15),
                    is_active=True
                ),
                Festival(
                    festival_id=4,
                    name="Varalakshmi Vratam",
                    region_tags=["Vizag", "Vijayawada", "Belgaum", "Mysuru"],
                    start_date=date(2026, 8, 10),
                    end_date=date(2026, 8, 25),
                    is_active=True
                ),
                Festival(
                    festival_id=5,
                    name="Aadi Festival",
                    region_tags=["Coimbatore", "Madurai", "Salem"],
                    start_date=date(2026, 7, 15),
                    end_date=date(2026, 8, 15),
                    is_active=True
                ),
                Festival(
                    festival_id=6,
                    name="Ganesh Chaturthi",
                    region_tags=["Mumbai", "Belgaum"],
                    start_date=date(2026, 9, 1),
                    end_date=date(2026, 9, 15),
                    is_active=True
                ),
                Festival(
                    festival_id=7,
                    name="Lohri",
                    region_tags=["Ludhiana", "Amritsar"],
                    start_date=date(2026, 1, 5),
                    end_date=date(2026, 1, 20),
                    is_active=True
                ),
                Festival(
                    festival_id=8,
                    name="Durga Puja",
                    region_tags=["Kolkata"],
                    start_date=date(2026, 10, 1),
                    end_date=date(2026, 10, 15),
                    is_active=True
                )
            ]
            session.add_all(festivals)
            session.commit()
            
        # Check if FestivalBoostRule is empty
        if len(session.exec(select(FestivalBoostRule)).all()) == 0:
            print("🌱 Seeding active festival boost rules...")
            boost_rules = [
                FestivalBoostRule(festival_id=1, category_id=1, max_boost=Decimal("0.30")),
                FestivalBoostRule(festival_id=1, category_id=2, max_boost=Decimal("0.40")),
                FestivalBoostRule(festival_id=1, category_id=3, max_boost=Decimal("0.50")),
                FestivalBoostRule(festival_id=1, category_id=4, max_boost=Decimal("0.25")),
                FestivalBoostRule(festival_id=2, category_id=1, max_boost=Decimal("0.45")),
                FestivalBoostRule(festival_id=2, category_id=2, max_boost=Decimal("0.50")),
                FestivalBoostRule(festival_id=2, category_id=4, max_boost=Decimal("0.40")),
                FestivalBoostRule(festival_id=3, category_id=2, max_boost=Decimal("0.50")),
                FestivalBoostRule(festival_id=4, category_id=2, max_boost=Decimal("0.50")),
                FestivalBoostRule(festival_id=4, category_id=4, max_boost=Decimal("0.45")),
                FestivalBoostRule(festival_id=5, category_id=2, max_boost=Decimal("0.40")),
                FestivalBoostRule(festival_id=6, category_id=1, max_boost=Decimal("0.45")),
                FestivalBoostRule(festival_id=7, category_id=1, max_boost=Decimal("0.40")),
                FestivalBoostRule(festival_id=8, category_id=2, max_boost=Decimal("0.50"))
            ]
            session.add_all(boost_rules)
            session.commit()

        # Check if OutfitBoard is empty
        from app.models.OutfitCircleSchema import OutfitBoard, BoardMember, PinnedProduct
        if len(session.exec(select(OutfitBoard)).all()) == 0:
            print("🌱 Seeding active Outfit Circles...")
            # We need to make sure user_id=1 exists
            user1 = session.get(User, 1)
            if not user1:
                user1 = User(
                    user_id=1,
                    name="Priya Sharma",
                    username="priya_patna",
                    password_hash="phone_auth_user",
                    city="Patna",
                    region="East",
                    latitude=Decimal("25.59409470"),
                    longitude=Decimal("85.13756450"),
                    address="Kankarbagh, Patna",
                    pincode="800020"
                )
                session.add(user1)
                session.commit()
                session.refresh(user1)

            # Create some boards
            b1 = OutfitBoard(
                board_id=1,
                name="Patna Gully Fashion Circle",
                created_by=1,
                circle_type="gully",
                city="Patna",
                description="Street styles, micro-trends, and local bazaar bargains in Patna."
            )
            b2 = OutfitBoard(
                board_id=2,
                name="Coimbatore College Hub",
                created_by=1,
                circle_type="college",
                city="Coimbatore",
                description="Campus wear and budget style challenges at Coimbatore colleges."
            )
            b3 = OutfitBoard(
                board_id=3,
                name="Ananya's Vizag Vibe (Creator)",
                created_by=1,
                circle_type="creator",
                city="Vizag",
                description="Daily college styling and fusion sarees by Vizag's top creator Ananya.",
                creator_avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            )
            session.add_all([b1, b2, b3])
            session.commit()

            # Add member relations
            session.add_all([
                BoardMember(board_id=1, user_id=1, role="admin", invite_status="accepted"),
                BoardMember(board_id=2, user_id=1, role="admin", invite_status="accepted"),
                BoardMember(board_id=3, user_id=1, role="admin", invite_status="accepted")
            ])
            session.commit()

            # Pin some items to board 1
            pin1 = PinnedProduct(
                board_id=1,
                pinned_by=1,
                product_id="top_003",
                product_name="Cotton Kurti",
                product_image_url="/catalog/top_003.jpg",
                product_price=1290.0,
                fit_video_url="https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-posing-4050-large.mp4",
                fit_review_text="Super soft fabric! Perfect for humid Patna weather. I ordered M, fits perfectly.",
                fit_height=162.0,
                fit_weight=56.0,
                fit_size_purchased="M",
                fit_feedback_badges="True to Size,Breathable",
                group_buy_eligible=True,
                group_buy_discount_rate=15.0,
                min_orders_required=3,
                is_local_bazaar_item=True,
                bazaar_shop_name="Pataliputra Weaves",
                canvas_x=120.0,
                canvas_y=150.0,
                canvas_scale=1.0,
                canvas_z_index=1
            )
            pin2 = PinnedProduct(
                board_id=1,
                pinned_by=1,
                product_id="bottom_003",
                product_name="Ivory Palazzo Silk Pants",
                product_image_url="/catalog/bot_003.jpg",
                product_price=890.0,
                fit_review_text="A bit long for my height, but fabric quality is beautiful. Strongly recommend!",
                fit_height=162.0,
                fit_weight=56.0,
                fit_size_purchased="M",
                fit_feedback_badges="Slightly Long",
                canvas_x=120.0,
                canvas_y=280.0,
                canvas_scale=1.0,
                canvas_z_index=2
            )
            session.add_all([pin1, pin2])
            session.commit()

seed_database()

def get_session():
    with Session(engine) as session:
        yield session