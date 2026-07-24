from typing import Optional
from decimal import Decimal
from sqlmodel import Session, select
import uuid
from app.models.UserSchema import User

class UserRepository:
    @staticmethod
    def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
        return session.get(User, user_id)

    @staticmethod
    def get_user_by_username(session: Session, username: str) -> Optional[User]:
        return session.exec(select(User).where(User.username == username)).first()

    @staticmethod
    def get_user_by_phone(session: Session, phone: str) -> Optional[User]:
        return session.exec(select(User).where(User.phone == phone)).first()

    @staticmethod
    def create_user(
        session: Session,
        name: str,
        password_hash: str,
        username: Optional[str] = None,
        phone: Optional[str] = None,
        city: Optional[str] = None,
        muted_festivals: Optional[list] = None
    ) -> User:
        if not username:
            username = f"user_{uuid.uuid4().hex[:8]}"
            
        user = User(
            name=name,
            username=username,
            password_hash=password_hash,
            phone=phone,
            city=city,
            muted_festivals=muted_festivals
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def save_user(session: Session, user: User) -> User:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
