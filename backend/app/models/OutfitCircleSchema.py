from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, List
from datetime import datetime
from sqlalchemy import UniqueConstraint
# Group / Board
class OutfitBoard(SQLModel, table=True):
    __tablename__ = "outfit_boards"
    board_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)  # e.g. "Goa Trip"
    created_by: int = Field(foreign_key="users.user_id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Members of a board
class BoardMember(SQLModel, table=True):
    __tablename__ = "board_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="outfit_boards.board_id", nullable=False)
    user_id: int = Field(foreign_key="users.user_id", nullable=False)
    role: str = Field(default="member", max_length=20)  # "admin" / "member"
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("board_id", "user_id", name="uq_board_user"),
    )


# Pinned product on a board
class PinnedProduct(SQLModel, table=True):
    __tablename__ = "pinned_products"
    pin_id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="outfit_boards.board_id", nullable=False)
    pinned_by: int = Field(foreign_key="users.user_id", nullable=False)
    product_id: str = Field(max_length=100, nullable=False)  # Myntra product id/SKU
    product_name: str = Field(max_length=255, nullable=False)
    product_image_url: str = Field(nullable=False)
    product_price: Optional[float] = Field(default=None)
    product_url: Optional[str] = Field(default=None)
    pinned_at: datetime = Field(default_factory=datetime.utcnow)


# Poll tied to a pinned product
class Poll(SQLModel, table=True):
    __tablename__ = "polls"
    poll_id: Optional[int] = Field(default=None, primary_key=True)
    pin_id: int = Field(foreign_key="pinned_products.pin_id", nullable=False)
    created_by: int = Field(foreign_key="users.user_id", nullable=False)
    question: str = Field(default="Should we get this?", max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    closes_at: Optional[datetime] = Field(default=None)


# Poll options (default: Yes/No, but extensible for size/color polls etc.)
class PollOption(SQLModel, table=True):
    __tablename__ = "poll_options"
    option_id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: int = Field(foreign_key="polls.poll_id", nullable=False)
    label: str = Field(max_length=100, nullable=False)  # "Yes", "No", "Red", "Blue" etc.


# Votes
class PollVote(SQLModel, table=True):
    __tablename__ = "poll_votes"
    vote_id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: int = Field(foreign_key="polls.poll_id", nullable=False)
    option_id: int = Field(foreign_key="poll_options.option_id", nullable=False)
    user_id: int = Field(foreign_key="users.user_id", nullable=False)
    voted_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("poll_id", "user_id", name="uq_poll_user_vote"),
    )