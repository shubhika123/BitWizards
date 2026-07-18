from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from sqlmodel import SQLModel, Field as SQLField
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

class GenieCurateRequest(BaseModel):
    query: Optional[str] = ""
    detected_language: Optional[str] = "Unknown"
    occasion_raw: Optional[str] = ""
    occasion_category: Optional[str] = None
    user_gender: Optional[str] = None
    primary_color: Optional[str] = None
    excluded_colors: List[str] = Field(default_factory=list)
    aesthetic_tags: List[str] = Field(default_factory=list)
    excluded_tags: List[str] = Field(default_factory=list)
    max_budget: Optional[int] = None
    is_local_preferred: bool = False
    confidence: Optional[str] = "low"
    ambiguous_fields: List[str] = Field(default_factory=list)
    locked_item_ids: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")

class GenieSwapRequest(BaseModel):
    slot_category: str  # Must be validated against "TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"
    current_outfit_ids: List[str]
    max_budget: int
    aesthetic_tags: List[str] = Field(default_factory=list)
    excluded_colors: List[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class GenieAlternativesRequest(BaseModel):
    category_to_refresh: Optional[str] = None
    slot_category: Optional[str] = None
    
    active_combination_ids: Optional[List[str]] = None
    current_outfit_ids: Optional[List[str]] = None
    
    max_budget: int
    occasion_category: Optional[str] = None
    aesthetic_tags: List[str] = Field(default_factory=list)
    excluded_colors: List[str] = Field(default_factory=list)
    page: int = 0
    
    model_config = ConfigDict(extra="ignore")

class GenieProduct(SQLModel, table=True):
    __tablename__ = "genie_products"
    
    id: str = SQLField(primary_key=True)
    name: str = SQLField(max_length=150, nullable=False)
    category: str = SQLField(max_length=50, nullable=False) # TOP, BOTTOM, FOOTWEAR, ACCESSORY
    price: int = SQLField(nullable=False)
    image_url: str = SQLField(max_length=500, nullable=False)
    occasions: List[str] = SQLField(default=[], sa_column=Column(JSON))
    colors: List[str] = SQLField(default=[], sa_column=Column(JSON))
    brand: Optional[str] = SQLField(default=None, max_length=100)
    rating: float = SQLField(default=4.0)
