from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import Session
from app.database import get_session
from typing import List, Dict, Any, Optional

from app.models.LocalBazaarSchema import BazaarNegotiationRequest, BazaarNegotiationResponse
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
    session: Session = Depends(get_session)
):
    """
    Get all nearby verified local boutiques, products, active festival, and theme configuration in a single payload.
    Response includes: state, active_festival, theme, boutiques[], products[].
    """
    return BazaarService.get_aggregated_bazaar_data(city, simulated_date, session)


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
def negotiate_price(req: BazaarNegotiationRequest):
    """
    Interactive 'Request Best Price' feature. Simulates local bazaar bargaining response.
    """
    if req.proposed_price <= 0:
        raise HTTPException(status_code=400, detail="Proposed price must be greater than zero")

    result = BazaarService.calculate_negotiation(req.original_price, req.proposed_price)
    return BazaarNegotiationResponse(**result)
