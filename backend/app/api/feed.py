from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.schemas import FeedRequest, FeedResponse
from app.services.database import MockDB
from app.services.gemini import GeminiService

router = APIRouter(prefix="/feed", tags=["feed"])

REGIONAL_TRENDS_MAP = {
    "Lucknow": ["Chikankari Kurtas", "Pastel Shades", "Cotton Dupattas"],
    "Jaipur": ["Bandhani Print Dupattas", "Gotta Patti Suits", "Rajasthani Mojris"],
    "Kerala": ["Kasavu Sarees", "Golden Border Veshthis", "Humid-friendly Linens"],
    "Delhi": ["Oversized Tees", "Utility Cargos", "Platform Sneakers"],
    "Patna": ["Lal Paar Sarees", "Tussar Silk Shawls", "Handloom Cottons"],
    "Coimbatore": ["Kanjeevaram Silk Sarees", "Coimbatore Cottons", "Golden Brocades"],
    "Vizag": ["Sharara Suit Sets", "Georgette Kurtis", "Traditional Anarkalis"]
}

DEFAULT_TRENDS = ["Oversized Tees", "Festive Kurtas", "Cotton Sarees"]

@router.post("", response_model=FeedResponse)
def get_personalized_feed(req: FeedRequest):
    """
    Computes a personalized product feed based on the user's location,
    weather, upcoming local festival, budget preference, and personal style.
    """
    products = MockDB.get_products()
    ranked_products = []
    
    context = {
        "region": req.region or "Lucknow",
        "weather": req.weather or "Summer",
        "festival": req.festival or "Raksha Bandhan",
        "budget": req.budget,
        "style": req.style
    }
    
    # Calculate scores for products
    for p in products:
        score = 0
        reasons_matched = []
        
        # Region match
        if context["region"] and p.get("region", "").lower() == context["region"].lower():
            score += 3
            reasons_matched.append(f"popular in {context['region']}")
            
        # Festival match
        if context["festival"]:
            matched_fest = [f for f in p.get("festivals", []) if f.lower() == context["festival"].lower()]
            if matched_fest:
                score += 4
                reasons_matched.append(f"perfect for {matched_fest[0]}")
                
        # Weather match
        if context["weather"]:
            matched_weather = [w for w in p.get("weather", []) if w.lower() == context["weather"].lower()]
            if matched_weather:
                score += 2
                reasons_matched.append(f"ideal for {context['weather']} weather")
                
        # Budget match
        if context["budget"]:
            if p.get("price", 0) <= context["budget"]:
                score += 2
                reasons_matched.append("fits your budget limit")
            else:
                score -= 3 # negative weight for over-budget items
                
        # Style match
        if context["style"]:
            if context["style"].lower() in p.get("style", "").lower():
                score += 2
                reasons_matched.append(f"matches your {context['style']} style preference")
                
        # Base score for quality / rating
        score += p.get("rating", 4.0)
        
        # Build explanation
        ai_reason = GeminiService.generate_recommendation_reason(p, context)
        
        # Add rating summary summary review
        ai_review_summary = GeminiService.summarize_reviews(p["name"], p.get("reviews", []))
        
        product_copy = p.copy()
        product_copy["score"] = score
        product_copy["ai_reason"] = ai_reason
        product_copy["ai_review_summary"] = ai_review_summary
        ranked_products.append(product_copy)
        
    # Sort products by score descending
    ranked_products.sort(key=lambda x: x["score"], reverse=True)
    
    # Extract regional trends
    trends = REGIONAL_TRENDS_MAP.get(context["region"], DEFAULT_TRENDS)
    
    return FeedResponse(
        context=context,
        products=ranked_products,
        regional_trends=trends
    )
