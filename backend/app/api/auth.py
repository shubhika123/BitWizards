from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.database import get_session
from app.repository.user_repo import UserRepository

router = APIRouter()

class RegisterUserRequest(BaseModel):
    name: str
    phone: str
    city: str | None = None

class CheckPhoneRequest(BaseModel):
    phone: str

class UpdateCityRequest(BaseModel):
    city: str

@router.post("/check-phone")
def check_phone(payload: CheckPhoneRequest, session: Session = Depends(get_session)):
    user = UserRepository.get_user_by_phone(session, payload.phone)
    return {"exists": user is not None}

@router.post("/register")
def register_user(payload: RegisterUserRequest, session: Session = Depends(get_session)):

    existing = UserRepository.get_user_by_phone(session, payload.phone)

    if existing:
        if existing.password_hash == "invite_pending_user":
            existing.name = payload.name
            existing.city = payload.city
            existing.password_hash = "phone_auth_user"
            UserRepository.save_user(session, existing)
            return {"user_id": existing.user_id, "name": existing.name, "username": existing.username, "phone": existing.phone, "city": existing.city}
        raise HTTPException(status_code=400, detail="Phone already registered")

    user = UserRepository.create_user(
        session=session,
        name=payload.name,
        phone=payload.phone,
        password_hash="phone_auth_user",
        city=payload.city
    )
    return {"user_id": user.user_id, "name": user.name, "username": user.username, "phone": user.phone, "city": user.city}

@router.patch("/users/{user_id}/city")
def update_user_city(
    user_id: int,
    payload: UpdateCityRequest,
    session: Session = Depends(get_session),
):
    """Update the user's registered home city (used by Local Bazaar delivery area)."""
    city = (payload.city or "").strip()
    if not city:
        raise HTTPException(status_code=400, detail="City is required")

    user = UserRepository.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.city = city
    UserRepository.save_user(session, user)
    return {
        "user_id": user.user_id,
        "name": user.name,
        "phone": user.phone,
        "city": user.city,
    }

@router.get("/verify/{user_id}")
def verify_user(user_id: int, session: Session = Depends(get_session)):
    user = UserRepository.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User no longer exists")
    return {"status": "active"}
