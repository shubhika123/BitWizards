from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, JSON


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: str = Field(primary_key=True)
    name: str
    category: str
    price: float

    # Using SQLAlchemy JSON for lists to ensure cross-database compatibility (SQLite / MySQL / Postgres)
    occasions: List[str] = Field(default=[], sa_column=Column(JSON))
    colors: List[str] = Field(default=[], sa_column=Column(JSON))
    aesthetic_tags: List[str] = Field(default=[], sa_column=Column(JSON))
    keywords: List[str] = Field(default=[], sa_column=Column(JSON))

    gender: str = Field(default="Unisex")
    image_url: str

    # Optional fields used by Apna Bazaar listings
    description: Optional[str] = Field(default=None)
    original_price: Optional[float] = Field(default=None)
    rating: Optional[float] = Field(default=None)
    trust_score: Optional[float] = Field(default=None)
