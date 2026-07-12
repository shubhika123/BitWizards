from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import feed, search, bazaar, social

app = FastAPI(
    title="Myntra Bharat Layer API",
    description="AI-powered Hyper-local Context and Discovery Layer for Tier 2/3 Markets.",
    version="1.0.0",
    debug=settings.DEBUG
)

# Enable CORS for Next.js frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(feed.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(bazaar.router, prefix="/api")
app.include_router(social.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Myntra Bharat Layer Backend",
        "version": "1.0.0",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }
