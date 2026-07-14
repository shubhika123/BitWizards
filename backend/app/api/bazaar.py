from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from backend.app.models.FestivalSchema import BazaarNegotiationRequest, BazaarNegotiationResponse
from app.services.database import MockDB

router = APIRouter(prefix="/bazaar", tags=["bazaar"])

@router.get("/boutiques", response_model=List[Dict[str, Any]])
def get_local_boutiques(city: Optional[str] = Query(None, description="Filter boutiques by city")):
    """
    Get all nearby verified local boutiques.
    """
    return MockDB.get_boutiques(city)

@router.post("/negotiate", response_model=BazaarNegotiationResponse)
def negotiate_price(req: BazaarNegotiationRequest):
    """
    Interactive 'Request Best Price' feature. Simulates local bazaar bargaining response.
    """
    original = req.original_price
    proposed = req.proposed_price
    
    if proposed <= 0:
        raise HTTPException(status_code=400, detail="Proposed price must be greater than zero")
        
    if proposed >= original:
        return BazaarNegotiationResponse(
            status="accepted",
            final_price=original,
            message="Thank you! The item is available at the standard listing price. Added to cart."
        )
        
    ratio = proposed / original
    
    # Negotiation Logic
    if ratio >= 0.92:
        # Accept proposed price
        return BazaarNegotiationResponse(
            status="accepted",
            final_price=proposed,
            message=f"Acceptable! The boutique has agreed to your price of ₹{proposed}. Limited festival stock reserved for you!"
        )
    elif ratio >= 0.82:
        # Counter-offer
        counter = int((original + proposed) / 2)
        # Ensure it's a clean round number
        counter = (counter // 10) * 10
        return BazaarNegotiationResponse(
            status="counter-offered",
            final_price=counter,
            message=f"Boutique response: 'Since you are shopping for the festival, we can do ₹{counter}. That is our absolute best price!'"
        )
    elif ratio >= 0.70:
        # Reject and suggest 85%
        counter = int(original * 0.85)
        counter = (counter // 10) * 10
        return BazaarNegotiationResponse(
            status="counter-offered",
            final_price=counter,
            message=f"Boutique response: '₹{proposed} is too low for pure handloom fabric. We can offer a festive discount down to ₹{counter}.'"
        )
    else:
        # Flat rejection
        counter = int(original * 0.90)
        counter = (counter // 10) * 10
        return BazaarNegotiationResponse(
            status="rejected",
            final_price=counter,
            message=f"Boutique response: 'Sorry, we cannot offer the item at ₹{proposed}. The lowest we can do for this premium work is ₹{counter}.'"
        )
