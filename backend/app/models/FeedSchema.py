from pydantic import BaseModel
from typing import Optional, List, Dict, Any

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
