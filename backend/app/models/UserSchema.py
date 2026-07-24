from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from sqlalchemy import Column, JSON

class User(SQLModel, table=True):
    __tablename__ = "users"

    user_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    username: Optional[str] = Field(default=None, max_length=50, unique=True)
    password_hash: str = Field(max_length=255, nullable=False)
    phone: Optional[str] = Field(default=None, max_length=20, unique=True)
    email: Optional[str] = Field(default=None, max_length=150, unique=True)
    city: Optional[str] = Field(default=None, max_length=100)
    muted_festivals: Optional[list] = Field(default=None, sa_column=Column(JSON))
