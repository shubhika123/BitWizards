from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import Column, UniqueConstraint
from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


class SahiDaamChallengeItem(SQLModel, table=True):
    __tablename__ = "sahidaam_challenge_items"

    id: str = Field(primary_key=True, max_length=64)
    product_id: Optional[str] = Field(default=None, max_length=64, index=True)
    actual_price: float = Field(nullable=False)
    category: Optional[str] = Field(default=None, max_length=100, index=True)
    name: Optional[str] = Field(default=None, max_length=255)
    image_url: Optional[str] = Field(default=None, max_length=1024)
    detail_tiers: Optional[list] = Field(default=None, sa_column=Column(JSON))


class SahiDaamDailyDeck(SQLModel, table=True):
    __tablename__ = "sahidaam_daily_decks"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_sahidaam_deck_user_date"),)

    id: str = Field(primary_key=True, max_length=64)
    user_id: str = Field(max_length=128, index=True, nullable=False)
    date: str = Field(max_length=32, index=True, nullable=False)
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class SahiDaamDeckCard(SQLModel, table=True):
    __tablename__ = "sahidaam_deck_cards"

    id: str = Field(primary_key=True, max_length=64)
    deck_id: str = Field(max_length=64, index=True, nullable=False)
    user_id: str = Field(max_length=128, index=True, nullable=False)
    item_id: str = Field(max_length=64, index=True, nullable=False)
    position: int = Field(default=0)
    status: str = Field(default="pending", max_length=32, index=True)
    shown_at: Optional[datetime] = Field(default=None)
    submitted_at: Optional[datetime] = Field(default=None)
    guess_amount: Optional[float] = Field(default=None)
    deviation_pct: Optional[float] = Field(default=None)
    base_points: Optional[int] = Field(default=None)
    speed_bonus_points: Optional[int] = Field(default=None)
    total_points: Optional[int] = Field(default=None)
    swipe_action: Optional[str] = Field(default=None, max_length=64)
    actual_price: float = Field(nullable=False)
    name: Optional[str] = Field(default=None, max_length=255)
    image_url: Optional[str] = Field(default=None, max_length=1024)
    detail_tiers: Optional[list] = Field(default=None, sa_column=Column(JSON))


class SahiDaamUserLedger(SQLModel, table=True):
    __tablename__ = "sahidaam_user_ledgers"

    user_id: str = Field(primary_key=True, max_length=128)
    points_balance: int = Field(default=0)
    streak_count: int = Field(default=0)
    last_played_date: Optional[date] = Field(default=None)


class SahiDaamUserPreferences(SQLModel, table=True):
    __tablename__ = "sahidaam_user_preferences"

    user_id: str = Field(primary_key=True, max_length=128)
    wishlist: Optional[list] = Field(default_factory=list, sa_column=Column(JSON))
    unrecommend: Optional[list] = Field(default_factory=list, sa_column=Column(JSON))


class SahiDaamInteraction(SQLModel, table=True):
    __tablename__ = "sahidaam_interactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    user_id: str = Field(max_length=128, index=True, nullable=False)
    card_id: Optional[str] = Field(default=None, max_length=64, index=True)
    item_id: Optional[str] = Field(default=None, max_length=64, index=True)
    event_type: str = Field(max_length=64, index=True, nullable=False)
    payload: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))


class SahiDaamPpiAggregate(SQLModel, table=True):
    __tablename__ = "sahidaam_ppi_aggregates"

    id: Optional[int] = Field(default=None, primary_key=True)
    category: Optional[str] = Field(default=None, max_length=100)
    region: Optional[str] = Field(default=None, max_length=100)
    age_band: Optional[str] = Field(default=None, max_length=32)
    gender: Optional[str] = Field(default=None, max_length=32)
    median_ppi: float = Field(default=1.0)
    sample_size: int = Field(default=0)
    computed_at: Optional[str] = Field(default=None, max_length=64)
