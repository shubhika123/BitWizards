# feedservice.py
from datetime import date as date_type
from decimal import Decimal
from typing import List, Optional

from sqlmodel import Session, select

from app.models.FestivalSchema import Festival, FestivalBoostRule, Category


def get_active_festivals(
    session: Session,
    region: Optional[str] = None,
    today: Optional[date_type] = None,
) -> List[Festival]:
    """Return festivals active today, optionally filtered by region."""
    today = today or date_type.today()

    statement = select(Festival).where(
        Festival.is_active == True,
        Festival.start_date <= today,
        Festival.end_date >= today,
    )
    festivals = session.exec(statement).all()

    if region:
        festivals = [
            f for f in festivals
            if not f.region_tags or region in f.region_tags
        ]

    return festivals


def get_category_boost_map(
    session: Session,
    festivals: List[Festival],
) -> List[dict]:
    """Given active festivals, return category_id -> max boost across those festivals,
    sorted descending by boost."""
    if not festivals:
        return []

    festival_ids = [f.festival_id for f in festivals]

    statement = (
        select(FestivalBoostRule, Category.category_name)
        .join(Category, Category.category_id == FestivalBoostRule.category_id)
        .where(FestivalBoostRule.festival_id.in_(festival_ids))
    )
    rows = session.exec(statement).all()

    boost_map: dict[int, dict] = {}
    for rule, category_name in rows:
        boost = float(rule.max_boost)  # Decimal -> float for clean JSON
        existing = boost_map.get(rule.category_id)
        if existing is None or boost > existing["boost"]:
            boost_map[rule.category_id] = {
                "category_id": rule.category_id,
                "category_name": category_name,
                "boost": boost,
            }

    return sorted(boost_map.values(), key=lambda x: x["boost"], reverse=True)