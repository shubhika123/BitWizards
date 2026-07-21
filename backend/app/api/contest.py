from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel

from app.database import get_session
from app.models.OutfitCircleSchema import ContestSubmission

router = APIRouter(prefix="/api/contest", tags=["Contest"])

class SubmitGuessRequest(BaseModel):
    user_id: int
    product_name: str
    category: str
    guessed_price: float
    actual_price: float
    coins_won: int
    result_msg: str

@router.post("/submit")
def submit_contest_guess(req: SubmitGuessRequest, session: Session = Depends(get_session)):
    submission = ContestSubmission(
        user_id=req.user_id,
        product_name=req.product_name,
        category=req.category,
        guessed_price=req.guessed_price,
        actual_price=req.actual_price,
        coins_won=req.coins_won,
        result_msg=req.result_msg
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    # Compute total coins
    total_coins_query = select(func.sum(ContestSubmission.coins_won)).where(ContestSubmission.user_id == req.user_id)
    total_coins = session.exec(total_coins_query).first() or 0

    return {
        "status": "success",
        "submission": submission,
        "total_coins": total_coins
    }

@router.get("/history")
def get_contest_history(user_id: int, session: Session = Depends(get_session)):
    statement = (
        select(ContestSubmission)
        .where(ContestSubmission.user_id == user_id)
        .order_by(ContestSubmission.created_at.desc())
    )
    history = session.exec(statement).all()

    # Calculate total coins
    total_coins = sum(h.coins_won for h in history)

    # Extract latest guessed price per category
    category_guesses = {}
    for item in reversed(history):  # Oldest to newest so latest overwrites
        category_guesses[item.category] = item.guessed_price

    return {
        "user_id": user_id,
        "total_coins": total_coins,
        "category_guesses": category_guesses,
        "history": history
    }

@router.get("/status")
def get_contest_status(user_id: int, session: Session = Depends(get_session)):
    statement = (
        select(ContestSubmission)
        .where(ContestSubmission.user_id == user_id)
        .order_by(ContestSubmission.created_at.desc())
    )
    history = session.exec(statement).all()

    today_date = date.today()
    today_played = any(h.created_at and h.created_at.date() == today_date for h in history)

    latest_today = next((h for h in history if h.created_at and h.created_at.date() == today_date), None) if today_played else None
    total_coins = sum(h.coins_won for h in history)

    return {
        "user_id": user_id,
        "played_today": today_played,
        "latest_today": latest_today,
        "total_coins": total_coins
    }
