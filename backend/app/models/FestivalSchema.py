from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlmodel import SQLModel, Field
from datetime import date
from sqlalchemy import ARRAY, String, Column
from sqlalchemy import Column, Integer, String, Date, Boolean, ARRAY
from sqlalchemy.orm import declarative_base
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from sqlalchemy import UniqueConstraint
from decimal import Decimal
from datetime import datetime
from sqlalchemy import JSON

#Festive Calender
class Festival(SQLModel, table=True):
    __tablename__="festivals"
    festival_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    region_tags: Optional[list] = Field(default=None, sa_column=Column(JSON))
    start_date: date
    end_date: date
    is_active: bool = Field(default=True)

#Festival wise category boost
class FestivalBoostRule(SQLModel, table=True):
    __tablename__ = "festival_boost_rules" 
    id: Optional[int] = Field(default=None, primary_key=True)
    festival_id: int = Field(foreign_key="festivals.festival_id")
    category_id: int =Field(nullable=False)
    tag: Optional[str] = Field(default=None, max_length=50)
    max_boost: Decimal = Field(max_digits=4, decimal_places=2, nullable=False)
    __table_args__ = (
        UniqueConstraint("festival_id", "category_id", "tag", name="uq_festival_category_tag"),
    )

class User(SQLModel, table=True):
    __tablename__ = "users"

    user_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    username: str = Field(max_length=50, unique=True, nullable=False)
    password_hash: str = Field(max_length=255, nullable=False)
    email: Optional[str] = Field(default=None, max_length=150, unique=True)
    region: Optional[str] = Field(default=None, max_length=50)
    city: Optional[str] = Field(default=None, max_length=100)
    latitude: Decimal = Field(max_digits=10, decimal_places=8, nullable=False)
    longitude: Decimal = Field(max_digits=11, decimal_places=8, nullable=False)
    address: Optional[str] = Field(default=None)
    pincode: Optional[str] = Field(default=None, max_length=10)
    muted_festivals: Optional[list] = Field(default=None, sa_column=Column(JSON))

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    category_id: Optional[int] = Field(default=None, primary_key=True)
    category_name: str = Field(max_length=100, nullable=False, unique=True)
class SearchRequest(BaseModel):
    query: str
    region: Optional[str] = None
    weather: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    parsed_intent: Dict[str, Any]
    products: List[Dict[str, Any]]

class FeedRequest(BaseModel):
    region: Optional[str] = None
    weather: Optional[str] = None
    festival: Optional[str] = None
    budget: Optional[int] = None
    style: Optional[str] = None

class FeedResponse(BaseModel):
    context: Dict[str, Any]
    products: List[Dict[str, Any]]
    regional_trends: List[str]

class BazaarNegotiationRequest(BaseModel):
    boutique_id: str
    product_id: str
    proposed_price: int
    original_price: int

class BazaarNegotiationResponse(BaseModel):
    status: str  # "accepted", "counter-offered", "rejected"
    final_price: int
    message: str

class VoteRequest(BaseModel):
    group_id: str
    item_id: str
    user: str

class CommentRequest(BaseModel):
    group_id: str
    item_id: str
    user: str
    text: str