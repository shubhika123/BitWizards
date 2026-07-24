from typing import List, Optional, Any, Dict
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
