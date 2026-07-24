from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from sqlmodel import Session
from pydantic import BaseModel
from app.models.GenieSchema import (
    NLPParseRequest,
    NLPParseResponse,
    GenieCurateRequest,
    GenieAlternativesRequest,
    GenieSwapRequest
)
import logging
import traceback
from app.services.gemini import GeminiService
from app.services.curation_engine import CurationEngine
from app.services.pruna import PrunaService
from app.database import get_session

route_logger = logging.getLogger("genie.try-on")

class TryOnRequest(BaseModel):
    person_image: str
    garment_images: List[str]

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
def curate_genie_outfit(req: GenieCurateRequest, session: Session = Depends(get_session)):
    """
    Curates a budget-compliant 4-piece outfit (Top, Bottom, Footwear, Accessory)
    using the local vector-similarity curation engine. Supports hard exclusions,
    item pinning, and a local-boutique consent prompt.
    """
    result = CurationEngine.generate_outfit(req, session)
    return GenieCurateResponse(
        outfit=result["outfit"],
        swap_boxes=result.get("swap_boxes"),
        budget_exceeded=result["budget_exceeded"],
        local_consent_prompt=result.get("local_consent_prompt"),
        nlp_parsed_data=req.model_dump() if hasattr(req, "model_dump") else req.dict()
    )


@router.post("/curate/alternatives", response_model=List[Dict[str, Any]])
def get_genie_alternatives(req: GenieAlternativesRequest, session: Session = Depends(get_session)):
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

    alternatives = CurationEngine.get_slot_alternatives(req, session)
    return alternatives


@router.post("/try-on")
def generate_virtual_try_on(req: TryOnRequest):
    """
    Executes a Pruna AI virtual try-on request.
    Takes base64 encoded person and garment images.
    """
    route_logger.info("[Route] POST /genie/try-on received")
    route_logger.info(f"[Route] person_image length = {len(req.person_image) if req.person_image else 0}")
    route_logger.info(f"[Route] garment_images count = {len(req.garment_images)}")
    for i, g in enumerate(req.garment_images):
        route_logger.info(f"[Route]   garment[{i}] = {g[:80]}")

    try:
        route_logger.info("[Route] Calling PrunaService.generate_try_on...")
        image_url = PrunaService.generate_try_on(req.person_image, req.garment_images)
        route_logger.info(f"[Route] generate_try_on returned: type={type(image_url).__name__}, value={image_url}")

        response_payload = {"image_url": image_url}
        route_logger.info(f"[Route] Returning payload: {response_payload}")
        return response_payload

    except Exception as e:
        route_logger.error(f"[Route] ❌ EXCEPTION caught: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Virtual try-on failed: {str(e)}")
