import os
from urllib.parse import quote_plus
# pyrefly: ignore [missing-import]
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
            print("🌱 Seeding active Raksha Bandhan festival...")
            f = Festival(
                festival_id=1,
                name="Raksha Bandhan",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 12, 31),
                is_active=True
            )
            session.add(f)
            session.commit()
            
        # Check if FestivalBoostRule is empty
        if len(session.exec(select(FestivalBoostRule)).all()) == 0:
            print("🌱 Seeding active festival boost rules...")
            b1 = FestivalBoostRule(festival_id=1, category_id=1, max_boost=Decimal("0.30"))
            b2 = FestivalBoostRule(festival_id=1, category_id=2, max_boost=Decimal("0.40"))
            b3 = FestivalBoostRule(festival_id=1, category_id=3, max_boost=Decimal("0.50"))
            b4 = FestivalBoostRule(festival_id=1, category_id=4, max_boost=Decimal("0.25"))
            b5 = FestivalBoostRule(festival_id=1, category_id=5, max_boost=Decimal("0.35"))
            session.add_all([b1, b2, b3, b4, b5])
            session.commit()

seed_database()

def get_session():
    with Session(engine) as session:
        yield session