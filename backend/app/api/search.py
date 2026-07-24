import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from typing import List, Dict, Any
from app.models.SearchSchema import SearchRequest, SearchResponse
from app.repository.product_repo import ProductRepository
from app.services.gemini import GeminiService
from app.database import get_session

logger = logging.getLogger("app.api.search")

router = APIRouter(prefix="/search", tags=["search"])

# Local in-memory cache for parsed search intents.
# Used during isolated NLP parser testing to avoid repeated Groq API calls for identical queries.
PARSED_INTENT_CACHE: Dict[str, Any] = {}


@router.post("", response_model=SearchResponse)
def search_products(req: SearchRequest, session: Session = Depends(get_session)):
    """
    NLP powered Search. CURRENTLY IN PARSER-ONLY TESTING MODE.
    Extracts search attributes from the natural language prompt and returns immediately
    to isolate intent extraction and save API quota.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    normalized_query = req.query.strip().lower()

    # 1. Check local cache first to avoid redundant API calls.
    if normalized_query in PARSED_INTENT_CACHE:
        logger.info(f"Cache hit for query: {normalized_query}")
        return SearchResponse(
            query=req.query,
            parsed_intent=PARSED_INTENT_CACHE[normalized_query],
            products=[]  # Empty list satisfies the schema contract so frontend won't crash
        )

    # 2. The ONLY API call made right now — isolates testing to just the core NLP logic.
    parsed_intent = GeminiService.parse_natural_language_search(req.query)

    # 3. Commit the parsed intent to the in-memory cache for future identical queries.
    PARSED_INTENT_CACHE[normalized_query] = parsed_intent
    logger.info(f"Cache miss — stored parsed intent for query: {normalized_query}")

    # 4. SHORT-CIRCUIT FOR DEV MODE: Return intent immediately with an empty products list.
    # This completely halts downstream loops, protecting your Groq TPM/RPM limit.
    return SearchResponse(
        query=req.query,
        parsed_intent=parsed_intent,
        products=[]  # Empty list satisfies the schema contract so frontend won't crash
    )

    # =========================================================================
    # THE REST OF THE PIPELINE IS TEMPORARILY BYPASSED UNTIL DB/CURATION IS READY
    # =========================================================================
    """
    region = parsed_intent.get("region") or req.region or "Lucknow"
    weather = parsed_intent.get("weather") or req.weather or "Summer"
    festival = parsed_intent.get("festival")
    budget = parsed_intent.get("budget")
    style = parsed_intent.get("style")
    categories = parsed_intent.get("categories") or []
    
    products = ProductRepository.get_all_products(session)
    matched_products = []
    
    context = {
        "region": region,
        "weather": weather,
        "festival": festival,
        "budget": budget,
        "style": style
    }
    
    for p in products:
        score = 0
        
        # Category matching
        cat_match = False
        if not categories:
            cat_match = True
        else:
            for cat in categories:
                if (cat.lower() in p["name"].lower() or 
                    cat.lower() in p["category"].lower() or 
                    cat.lower() in p["sub_category"].lower() or
                    cat.lower() in p["description"].lower()):
                    cat_match = True
                    score += 5
                    break
        
        if not cat_match:
            continue
            
        if festival:
            matched_fest = [f for f in p.get("festivals", []) if f.lower() == festival.lower()]
            if matched_fest:
                score += 8
            else:
                score -= 2
                
        if region and p.get("region", "").lower() == region.lower():
            score += 5
            
        if weather:
            matched_weather = [w for w in p.get("weather", []) if w.lower() == weather.lower()]
            if matched_weather:
                score += 3
                
        if budget:
            if p["price"] <= budget:
                score += 5
            else:
                continue
                
        if style and style.lower() in p.get("style", "").lower():
            score += 4
            
        q_words = req.query.lower().split()
        for word in q_words:
            if len(word) > 2:
                if word in p["name"].lower():
                    score += 2
                if word in p["description"].lower():
                    score += 1
                    
        score += p.get("rating", 4.0)
        
        # O(N) API Calls completely bypassed above
        ai_reason = GeminiService.generate_recommendation_reason(p, context)
        ai_review_summary = GeminiService.summarize_reviews(p["name"], p.get("reviews", []))
        
        product_copy = p.copy()
        product_copy["score"] = score
        product_copy["ai_reason"] = ai_reason
        product_copy["ai_review_summary"] = ai_review_summary
        matched_products.append(product_copy)
        
    matched_products.sort(key=lambda x: x["score"], reverse=True)
    """