import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import feed, search, bazaar, social, genie, sahidaam, admin, auth
from app.api.OutfitCircle import router as outfit_circle_router

# Configure logging so pipeline steps are visible in the uvicorn terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(name)s] %(message)s",
    datefmt="%H:%M:%S"
)




app = FastAPI(
    title="BitWizards",
    description="AI-powered Fashion App",
    version="1.0.0",
    debug=settings.DEBUG
)

# Enable CORS for Next.js frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://bitwizards.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(feed.router)  # Expose /fetch-feed at root level
app.include_router(outfit_circle_router)  # Expose /outfit-circle at root level
app.include_router(search.router, prefix="/api")
app.include_router(bazaar.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(genie.router, prefix="/api")
app.include_router(sahidaam.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/auth")


@app.on_event("startup")
def _startup_sahidaam_assortment():
    """Pick/persist the shared 8-product Sahi Daam assortment when the server boots."""
    from app.repository.sahidaam_repo import SahiDaamRepository

    try:
        SahiDaamRepository.init_mock_db()
        logging.getLogger(__name__).info("Sahi Daam assortment ready")
    except Exception:
        logging.getLogger(__name__).exception("Failed to initialize Sahi Daam assortment")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "BitWizards Backend",
        "version": "1.0.0",
        "groq_api_configured": bool(settings.GROQ_API_KEY)
    }
