from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.GenieSchema import NLPParseRequest, NLPParseResponse
from app.services.gemini import GeminiService

router = APIRouter(prefix="/genie", tags=["genie"])

class GenieCurateRequest(BaseModel):
    occasion: str
    color: Optional[str] = None
    max_budget: Optional[int] = None

class GenieProductResponse(BaseModel):
    id: str
    name: str
    category: str
    price: int
    image_url: str
    brand: Optional[str] = None
    rating: float

@router.post("/parse", response_model=NLPParseResponse)
def parse_genie_prompt(req: NLPParseRequest):
    """
    Parses natural language prompts (English/Hinglish/Regional) to extract fashion intent attributes according to the upgraded schema.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    parsed = GeminiService.parse_genie_query(req.query)
    return NLPParseResponse(**parsed)

@router.post("/curate", response_model=List[GenieProductResponse])
def curate_genie_outfit(req: GenieCurateRequest):
    """
    Curates a budget-compliant 4-piece outfit (Top, Bottom, Footwear, Accessory) matching the occasion and color.
    """
    curated = GeminiService.curate_genie_outfit(
        occasion=req.occasion,
        color=req.color,
        max_budget=req.max_budget
    )
    
    return [
        GenieProductResponse(
            id=p["id"],
            name=p["name"],
            category=p["category"],
            price=p["price"],
            image_url=p["image_url"],
            brand=p.get("brand"),
            rating=p.get("rating", 4.0)
        )
        for p in curated
    ]
