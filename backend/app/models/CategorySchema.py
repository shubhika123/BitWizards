from sqlmodel import SQLModel, Field
from typing import Optional

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    category_id: Optional[int] = Field(default=None, primary_key=True)
    category_name: str = Field(max_length=100, nullable=False, unique=True)
