   
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlmodel import SQLModel, Field
from datetime import date
from sqlalchemy import ARRAY, String, Column
from sqlalchemy import Column, Integer, String, Date, Boolean, ARRAY,JSON
from sqlalchemy.orm import declarative_base
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from sqlalchemy import UniqueConstraint
from decimal import Decimal
from datetime import datetime 

class Seller(SQLModel, table=True):
    __tablename__ = "sellers"
    seller_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=150, nullable=False)
    seller_name: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    region_tags: Optional[list] = Field(default=None, sa_column=Column(JSON))
    speciality: Optional[str] = Field(default=None, max_length=200)
    latitude: Decimal = Field(max_digits=10, decimal_places=8, nullable=False)
    longitude: Decimal = Field(max_digits=11, decimal_places=8, nullable=False)
    rating: Decimal = Field(default=Decimal("4.0"), max_digits=3, decimal_places=2)
    is_verified: bool = Field(default=True)
    trust_score: Decimal = Field(default=Decimal("100.00"), max_digits=5, decimal_places=2)
   
class SellerCatalog(SQLModel, table=True):
    __tablename__ = "seller_catalog"
    listing_id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="sellers.seller_id", nullable=False)
    product_id: int = Field(nullable=False)  # FK to shared products table
    price: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    stock_qty: int = Field(default=10)
    delivery_estimate: Optional[str] = Field(default=None, max_length=50)
    pickup_available: bool = Field(default=True)
    pickup_estimate: Optional[str] = Field(default=None, max_length=50)
    allows_tailoring: bool = Field(default=False)
    tailoring_cost: Decimal = Field(default=Decimal("0.00"), max_digits=8, decimal_places=2)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("seller_id", "product_id", name="uq_seller_product"),
    )

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Enum as SAEnum
from typing import Optional
from decimal import Decimal
from datetime import datetime
import enum

class BargainStatus(str, enum.Enum):
    active = "active"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"

class BargainSession(SQLModel, table=True):
    __tablename__ = "bargain_sessions"

    session_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id", nullable=False)
    seller_id: int = Field(foreign_key="sellers.seller_id", nullable=False)
    listing_id: int = Field(foreign_key="seller_catalog.listing_id", nullable=False)
    listed_price: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    user_latest_bid: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    seller_counter_bid: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    final_price: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    round_number: int = Field(default=1)  # capped at 2, enforced in app logic
    status: BargainStatus = Field(
        default=BargainStatus.active,
        sa_column=Column(SAEnum(BargainStatus, name="bargain_status"))
    )
    chat_log: Optional[list] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BazaarNegotiationRequest(BaseModel):
    boutique_id: str
    product_id: str
    proposed_price: int
    original_price: int

class BazaarNegotiationResponse(BaseModel):
    status: str  # "accepted", "counter-offered", "rejected"
    final_price: int
    message: str
