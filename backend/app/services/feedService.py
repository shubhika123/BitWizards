# feedservice.py
from datetime import date as date_type
from decimal import Decimal
from typing import List, Optional
from sqlmodel import Session
from app.models.FestivalSchema import Festival
from app.models.CategorySchema import Category
from app.repository.feed_repo import FeedRepository


def get_active_festivals(
    session: Session,
    city: Optional[str] = None,
    today: Optional[date_type] = None,
) -> List[Festival]:
    """Return festivals active today, optionally filtered by city or national tag."""
    today = today or date_type.today()

    festivals = FeedRepository.get_active_festivals(session, today)

    if city:
        city_lower = city.strip().lower()
        matched = []
        for f in festivals:
            if not f.region_tags or "All" in f.region_tags or "National" in f.region_tags:
                matched.append(f)
            else:
                tags_lower = [t.lower() for t in f.region_tags]
                if city_lower in tags_lower:
                    matched.append(f)
        return matched

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

    rows = FeedRepository.get_boost_rules_with_category_name(session, festival_ids)

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