import os
from sqlalchemy import text
from sqlmodel import Session, create_engine
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL found.")
    exit(1)

print(f"Connecting to {DATABASE_URL.split(':')[0]}...")
engine = create_engine(DATABASE_URL)

try:
    with engine.begin() as conn:
        print("Adding max_delivery_radius_km...")
        conn.execute(text("ALTER TABLE sellers ADD COLUMN max_delivery_radius_km NUMERIC(6, 2) DEFAULT 5.00;"))
        print("Added max_delivery_radius_km")
except Exception as e:
    print("max_delivery_radius_km error (might already exist):", e)

try:
    with engine.begin() as conn:
        print("Adding same_day_capable...")
        conn.execute(text("ALTER TABLE sellers ADD COLUMN same_day_capable BOOLEAN DEFAULT TRUE;"))
        print("Added same_day_capable")
except Exception as e:
    print("same_day_capable error (might already exist):", e)

print("Schema update complete.")
