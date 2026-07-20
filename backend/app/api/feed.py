from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.database import get_session
from app.services.feedService import get_active_festivals, get_category_boost_map
from app.api.OutfitCircle import router as outfit_circle_router

router = APIRouter()
router.include_router(outfit_circle_router)

@router.get("/fetch-feed")
def fetch_feed(
    region: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    festivals = get_active_festivals(session, region=region)
    boost_map = get_category_boost_map(session, festivals)
    return boost_map