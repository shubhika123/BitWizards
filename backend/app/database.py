import os
from urllib.parse import quote_plus
from sqlmodel import create_engine, Session

password = quote_plus("jiya@123")
DATABASE_URL = f"mysql+pymysql://root:{password}@localhost:3306/myntra"

engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    with Session(engine) as session:
        yield session