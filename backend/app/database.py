import os
import logging
from dotenv import load_dotenv

from sqlmodel import create_engine, Session, SQLModel, select

# Initialize logger for database
logger = logging.getLogger("app.database")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

# Load environment variables from .env file into os.environ
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.warning("No DATABASE_URL found in environment. Defaulting to local SQLite.")
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "myntra.db"))
    DATABASE_URL = f"sqlite:///{sqlite_path}"

logger.info(f"Resolved DATABASE_URL starting with: {DATABASE_URL.split(':')[0]}...")

# 3. Setup the engine safely
try:
    logger.info("Attempting primary database connection...")
    # If using SQLite (via Render env var), we need specific connect_args
    connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

    engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

    # Test connection immediately
    with engine.connect() as conn:
        logger.info("✅ Primary database connection successful!")

except Exception as e:
    logger.error(f"⚠️ Primary DB connection failed. Reason: {type(e).__name__} - {str(e)}")
    print(f"⚠️ Primary DB connection failed: {e}. Falling back to local SQLite.")
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "myntra.db"))
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

# Ensure all models are registered
import app.models.OutfitCircleSchema
import app.models.FestivalSchema
import app.models.LocalBazaarSchema
import app.models.ProductSchema
import app.models.UserSchema
import app.models.CategorySchema

# Create tables
SQLModel.metadata.create_all(engine)


def _ensure_bazaar_schema():
    """
    Best-effort schema upgrade for local SQLite when models change.
    Drops/recreates bazaar tables if critical columns are missing.
    """
    from sqlalchemy import inspect, text

    try:
        insp = inspect(engine)
        tables = set(insp.get_table_names())
    except Exception as e:
        logger.warning(f"Could not inspect DB schema: {e}")
        return

    with engine.begin() as conn:
        if "festivals" in tables:
            fest_cols = {c["name"] for c in insp.get_columns("festivals")}
            if "slug" not in fest_cols:
                logger.info("Adding festivals.slug column...")
                conn.execute(text("ALTER TABLE festivals ADD COLUMN slug VARCHAR(120)"))

        if "products" in tables:
            prod_cols = {c["name"] for c in insp.get_columns("products")}
            for col_name, col_sql in [
                ("description", "TEXT"),
                ("original_price", "FLOAT"),
                ("rating", "FLOAT"),
                ("trust_score", "FLOAT"),
            ]:
                if col_name not in prod_cols:
                    logger.info(f"Adding products.{col_name} column...")
                    conn.execute(text(f"ALTER TABLE products ADD COLUMN {col_name} {col_sql}"))

        rebuild_sellers = False
        if "sellers" in tables:
            seller_cols = {c["name"] for c in insp.get_columns("sellers")}
            if "external_id" not in seller_cols or "distance_km" not in seller_cols or "state" not in seller_cols:
                rebuild_sellers = True

        if "seller_catalog" in tables:
            listing_cols = {c["name"] for c in insp.get_columns("seller_catalog")}
            if "original_price" not in listing_cols or "distance_km" not in listing_cols:
                rebuild_sellers = True

        if rebuild_sellers:
            logger.info("Rebuilding bazaar seller tables for new schema...")
            for t in ("bargain_sessions", "seller_catalog", "sellers", "bazaar_themes"):
                conn.execute(text(f"DROP TABLE IF EXISTS {t}"))

    SQLModel.metadata.create_all(engine)


_ensure_bazaar_schema()


# Seed database if empty
def seed_database():
    from app.models.FestivalSchema import Festival, FestivalBoostRule, festival_name_to_slug
    from app.models.CategorySchema import Category
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

        # Check if Product is empty
        from app.models.ProductSchema import Product
        from app.services.database import CATALOG
        if len(session.exec(select(Product)).all()) == 0:
            print("🌱 Seeding active Products from CATALOG...")
            products = [Product(**item) for item in CATALOG]
            session.add_all(products)
            session.commit()

        # Check if Festival is empty
        if len(session.exec(select(Festival)).all()) == 0:
            print("🌱 Seeding active National & Regional festivals...")
            festivals = [
                Festival(
                    festival_id=1,
                    name="Raksha Bandhan",
                    slug=festival_name_to_slug("Raksha Bandhan"),
                    region_tags=["All"],
                    start_date=date(2026, 8, 1),
                    end_date=date(2026, 8, 31),
                    is_active=True,
                ),
                Festival(
                    festival_id=2,
                    name="Diwali",
                    slug=festival_name_to_slug("Diwali"),
                    region_tags=["All"],
                    start_date=date(2026, 10, 20),
                    end_date=date(2026, 11, 20),
                    is_active=True,
                ),
                Festival(
                    festival_id=3,
                    name="Chhath Puja",
                    slug=festival_name_to_slug("Chhath Puja"),
                    region_tags=["Patna"],
                    start_date=date(2026, 11, 1),
                    end_date=date(2026, 11, 15),
                    is_active=True,
                ),
                Festival(
                    festival_id=4,
                    name="Varalakshmi Vratam",
                    slug=festival_name_to_slug("Varalakshmi Vratam"),
                    region_tags=["Vizag", "Vijayawada", "Belgaum", "Mysuru"],
                    start_date=date(2026, 8, 10),
                    end_date=date(2026, 8, 25),
                    is_active=True,
                ),
                Festival(
                    festival_id=5,
                    name="Aadi Festival",
                    slug=festival_name_to_slug("Aadi Festival"),
                    region_tags=["Coimbatore", "Madurai", "Salem"],
                    start_date=date(2026, 7, 15),
                    end_date=date(2026, 8, 15),
                    is_active=True,
                ),
                Festival(
                    festival_id=6,
                    name="Ganesh Chaturthi",
                    slug=festival_name_to_slug("Ganesh Chaturthi"),
                    region_tags=["Mumbai", "Belgaum"],
                    start_date=date(2026, 9, 1),
                    end_date=date(2026, 9, 15),
                    is_active=True,
                ),
                Festival(
                    festival_id=7,
                    name="Lohri",
                    slug=festival_name_to_slug("Lohri"),
                    region_tags=["Ludhiana", "Amritsar"],
                    start_date=date(2026, 1, 5),
                    end_date=date(2026, 1, 20),
                    is_active=True,
                ),
                Festival(
                    festival_id=8,
                    name="Durga Puja",
                    slug=festival_name_to_slug("Durga Puja"),
                    region_tags=["Kolkata"],
                    start_date=date(2026, 10, 1),
                    end_date=date(2026, 10, 15),
                    is_active=True,
                ),
            ]
            session.add_all(festivals)
            session.commit()
        else:
            for fest in session.exec(select(Festival)).all():
                if not fest.slug:
                    fest.slug = festival_name_to_slug(fest.name)
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
                FestivalBoostRule(festival_id=8, category_id=2, max_boost=Decimal("0.50")),
            ]
            session.add_all(boost_rules)
            session.commit()

    # Seed Apna Bazaar catalog + themes from JSON fixtures (idempotent)
    try:
        from scripts.seed_bazaar_from_json import seed_bazaar_from_json

        stats = seed_bazaar_from_json(force=False)
        if any(stats.get(k, 0) for k in ("sellers", "products", "listings", "themes", "festivals_slugged")):
            print(f"🌱 Bazaar seed: {stats}")
    except Exception as e:
        logger.warning(f"Bazaar seed skipped/failed: {e}")


seed_database()


def get_session():
    with Session(engine) as session:
        yield session
