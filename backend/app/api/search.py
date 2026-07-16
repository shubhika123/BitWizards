from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.FestivalSchema import SearchRequest, SearchResponse
from app.services.database import MockDB
from app.services.gemini import GeminiService

router = APIRouter(prefix="/search", tags=["search"])

@router.post("", response_model=SearchResponse)
def search_products(req: SearchRequest):
    """
    NLP powered Search. First extracts search attributes (categories, region, festival, budget, style)
    from the natural language prompt, and then finds matching products.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
    # Extract intent from natural language query using Gemini (or fallback)
    parsed_intent = GeminiService.parse_natural_language_search(req.query)
    
    # Merge query context with optional request context if not parsed by LLM
    region = parsed_intent.get("region") or req.region or "Lucknow"
    weather = parsed_intent.get("weather") or req.weather or "Summer"
    festival = parsed_intent.get("festival")
    budget = parsed_intent.get("budget")
    style = parsed_intent.get("style")
    categories = parsed_intent.get("categories") or []
    
    products = MockDB.get_products()
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
            cat_match = True  # If user didn't specify category, allow all
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
            continue  # category mismatch, filter out
            
        # Festival match
        if festival:
            matched_fest = [f for f in p.get("festivals", []) if f.lower() == festival.lower()]
            if matched_fest:
                score += 8
            else:
                score -= 2
                
        # Region match
        if region and p.get("region", "").lower() == region.lower():
            score += 5
            
        # Weather match
        if weather:
            matched_weather = [w for w in p.get("weather", []) if w.lower() == weather.lower()]
            if matched_weather:
                score += 3
                
        # Budget filter/score
        if budget:
            if p["price"] <= budget:
                score += 5
            else:
                continue  # Hard filter for budget constraints
                
        # Style match
        if style and style.lower() in p.get("style", "").lower():
            score += 4
            
        # Add basic search term relevance
        q_words = req.query.lower().split()
        for word in q_words:
            if len(word) > 2:
                if word in p["name"].lower():
                    score += 2
                if word in p["description"].lower():
                    score += 1
                    
        # Add rating boost
        score += p.get("rating", 4.0)
        
        # Build explanation and review summaries for search outcomes
        ai_reason = GeminiService.generate_recommendation_reason(p, context)
        ai_review_summary = GeminiService.summarize_reviews(p["name"], p.get("reviews", []))
        
        product_copy = p.copy()
        product_copy["score"] = score
        product_copy["ai_reason"] = ai_reason
        product_copy["ai_review_summary"] = ai_review_summary
        matched_products.append(product_copy)
        
    # Sort matched products by similarity score
    matched_products.sort(key=lambda x: x["score"], reverse=True)
    
    return SearchResponse(
        query=req.query,
        parsed_intent=parsed_intent,
        products=matched_products
    )
