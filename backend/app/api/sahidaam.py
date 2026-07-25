from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import datetime

from app.services import sahidaam_db
from app.services.admin_dashboard import get_dashboard_metrics

router = APIRouter(prefix="/sahidaam", tags=["SahiDaam"])

# Stub for auth - we use a mock user ID for now as requested by typical hackathon flows
def get_current_user(x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        return x_user_id
    return "demo_user_123"

class SubmitGuessRequest(BaseModel):
    guess_amount: float
    slider_adjustments: int = 0
    hesitation_seconds: Optional[float] = None


class SwipeActionRequest(BaseModel):
    action: str

@router.get("/deck/today")
def get_today_deck(user_id: str = Depends(get_current_user)):
    """Returns the user's deck for today, generating it if it doesn't exist yet. Only returns cards with status = 'pending'."""
    try:
        cards = sahidaam_db.get_today_deck(user_id)
        return {"cards": cards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deck/card/{card_id}/shown")
def mark_card_shown(card_id: str, user_id: str = Depends(get_current_user)):
    """Marks a card shown, sets shown_at = now() (idempotent). Returns the server timestamp."""
    try:
        shown_at = sahidaam_db.mark_card_shown(card_id, user_id)
        return {"shown_at": shown_at.isoformat()}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deck/card/{card_id}/submit")
def submit_card(card_id: str, req: SubmitGuessRequest, user_id: str = Depends(get_current_user)):
    """Validates card is shown. Computes deviation, base points, speed bonus. Updates ledger + streak. Returns the reveal payload."""
    try:
        result = sahidaam_db.submit_card(
            card_id,
            user_id,
            req.guess_amount,
            slider_adjustments=req.slider_adjustments,
            hesitation_seconds=req.hesitation_seconds,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deck/card/{card_id}/swipe")
def swipe_card(card_id: str, req: SwipeActionRequest, user_id: str = Depends(get_current_user)):
    """Logs the swipe action. If card is still pending/shown and has no guess_amount, also sets status = dismissed."""
    try:
        sahidaam_db.swipe_card(card_id, user_id, req.action)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rewards/summary")
def get_rewards_summary(user_id: str = Depends(get_current_user)):
    """Points balance + streak + today flags, for FAB badge / end-of-deck."""
    try:
        return sahidaam_db.get_rewards_summary(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights/sample")
def get_insights_sample():
    """Pre-seeded aggregate insight(s), used to demonstrate the pricing-data value."""
    try:
        # Return the first pre-seeded aggregate insight
        if sahidaam_db.ppi_aggregates:
            return sahidaam_db.ppi_aggregates[0]
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/over-guessed")
def get_over_guessed_recommendations():
    """Returns top items that users perceive to have higher value than their actual price."""
    try:
        metrics = get_dashboard_metrics()
        # From metrics, we extract price_iq.highest_perceived_gain
        # It's a list of dicts with name, image_url, actual_price, guess_amount, error_pct
        return {"items": metrics.get("price_iq", {}).get("highest_perceived_gain", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
