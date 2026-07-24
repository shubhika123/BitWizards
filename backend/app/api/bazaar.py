from fastapi import APIRouter, HTTPException, Query
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
    return BazaarRepository.get_local_boutiques(city)

@router.get("/data", response_model=Dict[str, Any])
def get_local_bazaar_data(city: Optional[str] = Query(None, description="Filter bazaar data by city")):
    """
    Get all nearby verified local boutiques and their products for the bazaar feed.
    Response includes: boutiques[], products[], state (city's state name).
    """
    return BazaarRepository.get_local_bazaar_data(city)

@router.get("/theme", response_model=Dict[str, Any])
def get_bazaar_theme(festival: Optional[str] = Query(None, description="Festival name to get theme config for")):
    """
    Get the UI theme configuration for a given festival.
    Returns banner images, colors, categories, and text copy for the Local Bazaar page.
    Falls back to the default theme if festival not found.
    """
    from app.services.database import MockDB
    return MockDB.get_bazaar_theme(festival)


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
