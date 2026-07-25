# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from app.services import admin_dashboard
from app.repository.sahidaam_repo import SahiDaamRepository

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def get_dashboard_data():
    """
    Returns the aggregated metrics for the Sahi Daam rudimentary PoC dashboard.
    """
    try:
        metrics = admin_dashboard.get_dashboard_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reseed-bazaar")
def reseed_bazaar():
    """Force re-seed the bazaar database from JSON fixtures."""
    try:
        from scripts.seed_bazaar_from_json import seed_bazaar_from_json
        stats = seed_bazaar_from_json(force=True)
        return {"status": "ok", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
