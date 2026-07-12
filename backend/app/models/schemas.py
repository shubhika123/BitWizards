from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SearchRequest(BaseModel):
    query: str
    region: Optional[str] = None
    weather: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    parsed_intent: Dict[str, Any]
    products: List[Dict[str, Any]]

class FeedRequest(BaseModel):
    region: Optional[str] = None
    weather: Optional[str] = None
    festival: Optional[str] = None
    budget: Optional[int] = None
    style: Optional[str] = None

class FeedResponse(BaseModel):
    context: Dict[str, Any]
    products: List[Dict[str, Any]]
    regional_trends: List[str]

class BazaarNegotiationRequest(BaseModel):
    boutique_id: str
    product_id: str
    proposed_price: int
    original_price: int

class BazaarNegotiationResponse(BaseModel):
    status: str  # "accepted", "counter-offered", "rejected"
    final_price: int
    message: str

class VoteRequest(BaseModel):
    group_id: str
    item_id: str
    user: str

class CommentRequest(BaseModel):
    group_id: str
    item_id: str
    user: str
    text: str
