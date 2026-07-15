from pydantic import BaseModel
from typing import Optional, List
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON

class NLPParseRequest(BaseModel):
    query: str

class NLPParseResponse(BaseModel):
    query: str
    detected_language: str  # one of: English, Hindi, Hinglish, Bengali, Tamil, Bhojpuri, Unknown
    occasion_raw: str
    occasion_category: Optional[str] = None  # Casual, Formal, Wedding, Party, Festive, Date, Work, Religious, Other, or null
    primary_color: Optional[str] = None
    excluded_colors: List[str] = []
    aesthetic_tags: List[str] = []
    excluded_tags: List[str] = []
    max_budget: Optional[int] = None
    is_local_preferred: bool = False
    confidence: str  # high, medium, low
    ambiguous_fields: List[str] = []

class GenieProduct(SQLModel, table=True):
    __tablename__ = "genie_products"
    
    id: str = Field(primary_key=True)
    name: str = Field(max_length=150, nullable=False)
    category: str = Field(max_length=50, nullable=False) # TOP, BOTTOM, FOOTWEAR, ACCESSORY
    price: int = Field(nullable=False)
    image_url: str = Field(max_length=500, nullable=False)
    occasions: List[str] = Field(default=[], sa_column=Column(JSON))
    colors: List[str] = Field(default=[], sa_column=Column(JSON))
    brand: Optional[str] = Field(default=None, max_length=100)
    rating: float = Field(default=4.0)
