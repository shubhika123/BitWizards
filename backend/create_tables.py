from sqlalchemy import create_engine, inspect
from sqlmodel import SQLModel
from app.models.FestivalSchema import Festival, FestivalBoostRule, User
from app.models.LocalBazaarSchema import Seller, SellerCatalog, BargainSession
from urllib.parse import quote_plus
password = quote_plus("jiya@123") 
DATABASE_URL = f"mysql+pymysql://root:{password}@localhost:3306/Myntra"

engine = create_engine(DATABASE_URL, echo=True)  


def create_all_tables():
    print("Creating tables (if they don't already exist)...\n")
    SQLModel.metadata.create_all(engine)

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"\n✅ Done. {len(tables)} table(s) in database:")
    for table_name in tables:
        print(f"\n--- {table_name} ---")
        for column in inspector.get_columns(table_name):
            print(f"  {column['name']}: {column['type']}")


if __name__ == "__main__":
    create_all_tables()