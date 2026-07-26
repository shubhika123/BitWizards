from datetime import date
from typing import List, Tuple
from sqlmodel import Session, select
from app.models.FestivalSchema import Festival, FestivalBoostRule
from app.models.CategorySchema import Category

class FeedRepository:
    @staticmethod
    def get_active_festivals(session: Session, today: date) -> List[Festival]:
        statement = select(Festival).where(
            Festival.is_active == True,
            Festival.start_date <= today,
            Festival.end_date >= today,
        )
        return session.exec(statement).all()

    @staticmethod
    def get_boost_rules_with_category_name(session: Session, festival_ids: List[int]) -> List[Tuple[FestivalBoostRule, str]]:
        statement = (
            select(FestivalBoostRule, Category.category_name)
            .join(Category, Category.category_id == FestivalBoostRule.category_id)
            .where(FestivalBoostRule.festival_id.in_(festival_ids))
        )
        return session.exec(statement).all()
