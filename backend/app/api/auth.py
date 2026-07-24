from fastapi import APIRouter, Depends, HTTPException, Body
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

@router.get("/verify/{user_id}")
def verify_user(user_id: int, session: Session = Depends(get_session)):
    user = UserRepository.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User no longer exists")
    return {"status": "active"}
