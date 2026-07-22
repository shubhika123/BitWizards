from fastapi import APIRouter, HTTPException
from app.services import admin_dashboard

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
