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

#Festive Calender
class Festival(SQLModel, table=True):
    __tablename__="festivals"
    festival_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    region_tags: list[str] = Field(sa_column=Column(ARRAY(String)))
    start_date: date
    end_date: date
    is_active: bool = Field(default=True)

#Festival wise category boost
class FestivalBoostRule(SQLModel, table=True):
    __tablename__ = "festival_boost_rules" 
    id: Optional[int] = Field(default=None, primary_key=True)
    festival_id: int = Field(foreign_key="festivals.festival_id")
    category_id: int = Field(foreign_key="categories.category_id")
    tag: Optional[str] = Field(default=None, max_length=50)
    max_boost: Decimal = Field(max_digits=4, decimal_places=2, nullable=False)
    __table_args__ = (
        UniqueConstraint("festival_id", "category_id", "tag", name="uq_festival_category_tag"),
    )

