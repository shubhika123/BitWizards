from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SearchRequest(BaseModel):
    query: str = Field(..., max_length=100)
    region: Optional[str] = None
    weather: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    parsed_intent: Dict[str, Any]
    products: List[Dict[str, Any]]
