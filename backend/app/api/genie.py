# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from app.models.GenieSchema import (
    NLPParseRequest,
    NLPParseResponse,
    GenieCurateRequest,
    GenieAlternativesRequest,
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
    swap_boxes: Optional[Dict[str, List[Dict[str, Any]]]] = None
    budget_exceeded: bool
    local_consent_prompt: Optional[str] = None
    nlp_parsed_data: Optional[Dict[str, Any]] = None


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
        swap_boxes=result.get("swap_boxes"),
        budget_exceeded=result["budget_exceeded"],
        local_consent_prompt=result.get("local_consent_prompt"),
        nlp_parsed_data=req.model_dump() if hasattr(req, "model_dump") else req.dict()
    )


@router.post("/curate/alternatives", response_model=List[Dict[str, Any]])
def get_genie_alternatives(req: GenieAlternativesRequest):
    """
    Returns exactly 3 ranked alternatives for a single outfit slot while
    respecting the remaining budget after accounting for the other 3 locked items.
    """
    # Use mapped category value
    slot = (req.category_to_refresh or req.slot_category or "").upper()
    if slot not in ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid slot_category. Must be one of ['TOP', 'BOTTOM', 'FOOTWEAR', 'ACCESSORY']."
        )

    alternatives = CurationEngine.get_slot_alternatives(req)
    return alternatives
