from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from sqlalchemy import Column, JSON, UniqueConstraint
from datetime import date

class Festival(SQLModel, table=True):
    __tablename__="festivals"
    festival_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    region_tags: Optional[list] = Field(default=None, sa_column=Column(JSON))
    start_date: date
    end_date: date
    is_active: bool = Field(default=True)

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