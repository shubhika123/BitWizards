from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.GenieSchema import (
    NLPParseRequest,
    NLPParseResponse,
    GenieCurateRequest,
    GenieSwapRequest
)
from app.services.gemini import GeminiService
from app.services.curation_engine import CurationEngine

router = APIRouter(prefix="/genie", tags=["genie"])


class GenieProductResponse(BaseModel):
    id: str
    name: str
    category: str
    price: int
    image_url: str
    brand: Optional[str] = None
    rating: float = 4.0


class GenieCurateResponse(BaseModel):
    outfit: List[Dict[str, Any]]
    budget_exceeded: bool
    local_consent_prompt: Optional[str] = None


@router.post("/parse", response_model=NLPParseResponse)
def parse_genie_prompt(req: NLPParseRequest):
    """
    Parses natural language prompts (English/Hinglish/Regional) to extract
    fashion intent attributes according to the upgraded multilingual schema.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    parsed = GeminiService.parse_genie_query(req.query)
    return NLPParseResponse(**parsed)


@router.post("/curate", response_model=GenieCurateResponse)
def curate_genie_outfit(req: GenieCurateRequest):
    """
    Curates a budget-compliant 4-piece outfit (Top, Bottom, Footwear, Accessory)
    using the local vector-similarity curation engine. Supports hard exclusions,
    item pinning, and a local-boutique consent prompt.
    """
    result = CurationEngine.generate_outfit(req)
    return GenieCurateResponse(
        outfit=result["outfit"],
        budget_exceeded=result["budget_exceeded"],
        local_consent_prompt=result["local_consent_prompt"]
    )


@router.post("/curate/alternatives", response_model=List[Dict[str, Any]])
def get_genie_alternatives(req: GenieSwapRequest):
    """
    Returns exactly 3 ranked alternatives for a single outfit slot while
    respecting the remaining budget after accounting for the other 3 locked items.
    """
    slot = req.slot_category.upper()
    if slot not in CurationEngine.VALID_SLOTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid slot_category. Must be one of {list(CurationEngine.VALID_SLOTS)}."
        )

    alternatives = CurationEngine.get_slot_alternatives(req)
    return alternatives
