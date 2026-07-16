from fastapi import FastAPI, Depends, Query
from sqlmodel import Session
from typing import Optional

from database import get_session 
from services.feedService import get_active_festivals, get_category_boost_map
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()  
from sqlmodel import SQLModel
from database import engine
import models.OutfitCircleSchema  # ensure models are registered before create_all
import models.FestivalSchema
import models.LocalBazaarSchema
from api.OutfitCircle import router as outfit_circle_router

app.include_router(outfit_circle_router)

app.include_router(outfit_circle_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/fetch-feed")
def fetch_feed(
    region: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    festivals = get_active_festivals(session, region=region)
    boost_map = get_category_boost_map(session, festivals)
    return boost_map