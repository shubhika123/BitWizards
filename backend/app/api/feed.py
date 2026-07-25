# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query
# pyrefly: ignore [missing-import]
from sqlmodel import Session
from typing import Optional

from app.database import get_session
from app.services.feedService import get_active_festivals, get_category_boost_map
from app.models.FestivalSchema import festival_name_to_slug

from datetime import datetime, date

router = APIRouter()


def _festival_slug(fest) -> Optional[str]:
    if not fest:
        return None
    return fest.slug or festival_name_to_slug(fest.name)


@router.get("/fetch-feed")
def fetch_feed(
    region: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    simulated_date: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    target_city = city or region
    target_date = date.today()
    if simulated_date:
        try:
            target_date = datetime.strptime(simulated_date.strip(), "%Y-%m-%d").date()
        except ValueError:
            pass

    festivals = get_active_festivals(session, city=target_city, today=target_date)
    boost_map = get_category_boost_map(session, festivals)

    # Separate national vs regional festival
    national_fest = next(
        (
            f
            for f in festivals
            if not f.region_tags or "All" in f.region_tags or "National" in f.region_tags
        ),
        None,
    )
    regional_fest = next(
        (
            f
            for f in festivals
            if f.region_tags and "All" not in f.region_tags and "National" not in f.region_tags
        ),
        None,
    )

    return {
        "date": str(target_date),
        "city": target_city,
        "active_festivals": [f.name for f in festivals],
        "active_festival_slugs": [_festival_slug(f) for f in festivals],
        "national_festival": national_fest.name if national_fest else None,
        "national_festival_slug": _festival_slug(national_fest),
        "regional_festival": regional_fest.name if regional_fest else None,
        "regional_festival_slug": _festival_slug(regional_fest),
        "boost_map": boost_map,
    }


@router.get("/api/festivals/active")
def get_active_festivals_endpoint(
    city: Optional[str] = Query(default=None),
    simulated_date: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    return fetch_feed(city=city, simulated_date=simulated_date, session=session)
