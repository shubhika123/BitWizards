from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import Session
from app.database import get_session
from typing import List, Dict, Any, Optional

from app.models.LocalBazaarSchema import (
    BazaarNegotiationRequest,
    BazaarNegotiationResponse,
    BazaarAcceptRequest,
)
from app.repository.bazaar_repo import BazaarRepository
from app.services.bazaar_service import BazaarService

router = APIRouter(prefix="/bazaar", tags=["bazaar"])


@router.get("/boutiques", response_model=List[Dict[str, Any]])
def get_local_boutiques(city: Optional[str] = Query(None, description="Filter boutiques by city")):
    """
    Get all nearby verified local boutiques.
    """
    try:
        return BazaarRepository.get_local_boutiques(city)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/data", response_model=Dict[str, Any])
def get_local_bazaar_data(
    city: Optional[str] = Query(None, description="Filter bazaar data by city"),
    simulated_date: Optional[str] = Query(None, description="Simulate festival date"),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    session: Session = Depends(get_session)
):
    """
    Get all nearby verified local boutiques, products, active festival, and theme configuration in a single payload.
    Response includes: state, active_festival, theme, boutiques[], products[].
    """
    return BazaarService.get_aggregated_bazaar_data(city, simulated_date, session, lat, lng)


@router.get("/cities", response_model=List[Dict[str, str]])
def get_bazaar_cities():
    """
    List cities that have Local Bazaar catalog data.
    Response: [{ "city": "Belgaum", "state": "Karnataka" }, ...]
    """
    return BazaarRepository.get_bazaar_cities()


@router.get("/theme", response_model=Dict[str, Any])
def get_bazaar_theme(
    festival: Optional[str] = Query(
        None, description="Festival name or slug to get theme config for"
    ),
):
    """
    Get the UI theme configuration for a given festival (by display name or slug).
    Falls back to the default theme if festival not found.
    """
    return BazaarRepository.get_bazaar_theme(festival)


@router.get("/probability", response_model=Dict[str, Any])
def get_bargain_probability(original_price: int, proposed_price: int):
    """
    Get the probability of a boutique accepting a proposed bargain.
    """
    if original_price <= 0:
        raise HTTPException(status_code=400, detail="Original price must be greater than zero")
    return BazaarService.get_bargain_probability(original_price, proposed_price)


@router.post("/negotiate", response_model=BazaarNegotiationResponse)
def negotiate_price(req: BazaarNegotiationRequest, session: Session = Depends(get_session)):
    """
    Interactive 'Bargain Best Price' feature. Simulates local bazaar bargaining response.
    Max 2 user bid rounds. Soft-persists to bargain_sessions when IDs resolve.
    """
    if req.proposed_price <= 0:
        raise HTTPException(status_code=400, detail="Proposed price must be greater than zero")
    if req.round_number < 1 or req.round_number > 2:
        raise HTTPException(status_code=400, detail="Negotiation is limited to 2 rounds")

    result = BazaarService.calculate_negotiation(req.original_price, req.proposed_price)

    persisted_id = BazaarRepository.persist_bargain_round(
        session,
        boutique_id=req.boutique_id,
        product_id=req.product_id,
        original_price=req.original_price,
        proposed_price=req.proposed_price,
        final_price=result["final_price"],
        status=result["status"],
        round_number=req.round_number,
        user_message=req.user_message,
        shop_message=result["message"],
        session_id=req.session_id,
    )

    return BazaarNegotiationResponse(
        status=result["status"],
        final_price=result["final_price"],
        message=result["message"],
        session_id=persisted_id if persisted_id is not None else req.session_id,
    )


@router.post("/negotiate/accept")
def accept_negotiation(req: BazaarAcceptRequest, session: Session = Depends(get_session)):
    """Mark an active bargain session as accepted at the agreed final price."""
    if req.final_price <= 0:
        raise HTTPException(status_code=400, detail="Final price must be greater than zero")
    if req.session_id is None:
        return {"ok": True, "persisted": False}
    ok = BazaarRepository.accept_bargain_session(session, req.session_id, req.final_price)
    return {"ok": True, "persisted": ok}


@router.get("/search", response_model=Dict[str, Any])
def search_products(
    q: str = Query(..., description="Search query"),
    city: str = Query(..., description="User's selected city"),
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    session: Session = Depends(get_session)
):
    """
    Multi-field search across products and sellers.
    Response: { "products": [{ product, offers }], "sellers": [...] }
    """
    return BazaarService.get_search_results(q, city, lat, lng, session)


@router.get("/sellers/{seller_id}/catalog", response_model=Dict[str, Any])
def get_seller_catalog(
    seller_id: str,
    session: Session = Depends(get_session)
):
    """
    Get seller details and their complete product catalog.
    """
    try:
        return BazaarService.get_seller_shop(seller_id, session)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
