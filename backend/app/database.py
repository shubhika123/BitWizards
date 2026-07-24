import os
from urllib.parse import quote_plus
from sqlalchemy import inspect
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
        pass
        
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

# Seed database if empty
def seed_database():
    from app.models.FestivalSchema import Festival, FestivalBoostRule
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

seed_database()

def get_session():
    with Session(engine) as session:
        yield session