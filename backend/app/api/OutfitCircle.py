# routers/outfit_circle.py
from fastapi import APIRouter, Depends, HTTPException, Header, Body
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from app.database import get_session
from app.models.OutfitCircleSchema import OutfitBoard, BoardMember, PinnedProduct, Poll, PollOption, PollVote
router = APIRouter(prefix="/outfit-circle", tags=["Outfit Circle"])

# ---------- Request/Response Schemas ----------

class CreateBoardRequest(BaseModel):
    name: str
    created_by: int
    member_ids: List[int] = []  # friends to add at creation
    circle_type: str = "classic"  # "classic", "gully", "college", "creator"
    city: Optional[str] = None
    description: Optional[str] = None
    creator_avatar_url: Optional[str] = None

class PinProductRequest(BaseModel):
    board_id: int
    pinned_by: int
    product_id: str
    product_name: str
    product_image_url: str
    product_price: Optional[float] = None
    product_url: Optional[str] = None

    # Reimagined columns
    fit_video_url: Optional[str] = None
    fit_review_text: Optional[str] = None
    fit_height: Optional[float] = None
    fit_weight: Optional[float] = None
    fit_size_purchased: Optional[str] = None
    fit_audio_review_url: Optional[str] = None
    fit_feedback_badges: Optional[str] = None

    group_buy_eligible: bool = False
    group_buy_discount_rate: Optional[float] = 0.0
    min_orders_required: Optional[int] = 3
    is_local_bazaar_item: bool = False
    bazaar_shop_name: Optional[str] = None

    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    canvas_scale: Optional[float] = None
    canvas_z_index: Optional[int] = None


class CreatePollRequest(BaseModel):
    pin_id: int
    created_by: int
    question: str = "Should we get this?"
    options: List[str] = ["Yes", "No"]
    closes_at: Optional[datetime] = None


class VoteRequest(BaseModel):
    poll_id: int
    option_id: int
    user_id: int


from app.repository.outfit_circle_repo import OutfitCircleRepository
from app.repository.user_repo import UserRepository

@router.post("/pins/{pin_id}/purchase")
def purchase_pin(pin_id: int, user_id: int = Body(..., embed=True), session: Session = Depends(get_session)):
    pin = OutfitCircleRepository.get_pin_by_id(session, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    existing = OutfitCircleRepository.get_pin_purchase(session, pin_id, user_id)

    if not existing:
        OutfitCircleRepository.create_pin_purchase(session, pin_id, user_id)

    purchases = OutfitCircleRepository.get_purchases_by_pin_id(session, pin_id)

    result = []
    for p in purchases:
        buyer = UserRepository.get_user_by_id(session, p.user_id)
        result.append({"user_id": p.user_id, "user_name": buyer.name if buyer else None})

    return {"purchases": result}
# ---------- Board ----------

@router.post("/boards")
def create_board(payload: CreateBoardRequest, session: Session = Depends(get_session)):
    board = OutfitCircleRepository.create_board(
        session=session,
        name=payload.name,
        created_by=payload.created_by,
        circle_type=payload.circle_type,
        city=payload.city,
        description=payload.description,
        creator_avatar_url=payload.creator_avatar_url
    )

    # creator is always the board owner and is active immediately
    OutfitCircleRepository.create_board_member(
        session=session,
        board_id=board.board_id,
        user_id=payload.created_by,
        role="admin",
        invite_status="accepted",
        accepted_at=datetime.utcnow(),
    )

    # invite other members first; they must accept later
    for uid in payload.member_ids:
        OutfitCircleRepository.create_board_member(
            session=session,
            board_id=board.board_id,
            user_id=uid,
            role="member",
            invite_status="pending",
            accepted_at=None,
        )

    return board


from app.models.UserSchema import User

@router.get("/boards/gully")
def get_gully_boards(city: Optional[str] = None, session: Session = Depends(get_session)):
    """
    Retrieve all gully/community/creator circles. Optionally filters by city.
    """
    boards = OutfitCircleRepository.get_gully_boards(session, city)
    result = []
    
    for b in boards:
        creator = UserRepository.get_user_by_id(session, b.created_by)
        member_count = OutfitCircleRepository.get_board_member_count(session, b.board_id)
        pin_count = OutfitCircleRepository.get_board_pin_count(session, b.board_id)
        result.append({
            "board_id": b.board_id,
            "name": b.name,
            "created_by": b.created_by,
            "created_by_name": creator.name if creator else "Admin",
            "created_at": b.created_at,
            "circle_type": b.circle_type,
            "city": b.city,
            "description": b.description,
            "creator_avatar_url": b.creator_avatar_url,
            "members_count": member_count,
            "pins_count": pin_count
        })
    return result

@router.get("/boards/{board_id}")
def get_board(board_id: int, session: Session = Depends(get_session)):
    board = OutfitCircleRepository.get_board_by_id(session, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    rows = OutfitCircleRepository.get_board_members_with_user_details(session, board_id)
    members = [
        {
            "user_id": m.user_id,
            "role": m.role,
            "name": name,
            "phone": phone,
            "city": getattr(m, "city", None),
            "invite_status": m.invite_status,
            "joined_at": m.joined_at,
            "accepted_at": m.accepted_at,
        }
        for m, name, phone in rows
    ]

    pins_raw = OutfitCircleRepository.get_pins_by_board_id(session, board_id)

    pins = []
    for pin in pins_raw:
        pinner = UserRepository.get_user_by_id(session, pin.pinned_by)
        pin_dict = pin.dict()
        pin_dict["pinned_by_name"] = pinner.name if pinner else None
        pins.append(pin_dict)

    return {"board": board, "members": members, "pins": pins}


@router.get("/users/{user_id}/boards")
def get_user_boards(user_id: int, session: Session = Depends(get_session)):
    return OutfitCircleRepository.get_boards_by_user_id(session, user_id)


@router.post("/boards/{board_id}/members/{user_id}")
def add_member(board_id: int, user_id: int, session: Session = Depends(get_session)):
    existing = OutfitCircleRepository.get_board_member(session, board_id, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already in board")

    member = OutfitCircleRepository.create_board_member(
        session=session,
        board_id=board_id,
        user_id=user_id,
        role="member",
        invite_status="pending",
        accepted_at=None,
    )
    return member


@router.post("/boards/{board_id}/members/{user_id}/accept")
def accept_member_invite(
    board_id: int,
    user_id: int,
    session: Session = Depends(get_session),
    x_user_phone: Optional[str] = Header(default=None, alias="X-User-Phone"),
):
    member = OutfitCircleRepository.get_board_member(session, board_id, user_id)
    if not member:
        raise HTTPException(status_code=404, detail="Invite not found")

    invited_user = UserRepository.get_user_by_id(session, user_id)
    if not invited_user:
        raise HTTPException(status_code=404, detail="Invited user not found")

    if not x_user_phone or invited_user.phone != x_user_phone.strip():
        raise HTTPException(status_code=403, detail="Not authorized to accept this invite")

    if member.invite_status == "accepted":
        return {"detail": "Invite already accepted", "member": member}

    member.invite_status = "accepted"
    member.accepted_at = datetime.utcnow()
    OutfitCircleRepository.save_board_member(session, member)
    return {"detail": "Invite accepted", "member": member}


# ---------- Pins ----------

@router.post("/pins")
def pin_product(payload: PinProductRequest, session: Session = Depends(get_session)):
    pin = OutfitCircleRepository.create_pin(session, payload.dict())
    return pin

@router.get("/boards/{board_id}/pins")
def get_board_pins(board_id: int, session: Session = Depends(get_session)):
    pins_raw = OutfitCircleRepository.get_pins_by_board_id(session, board_id)
    result = []
    for pin in pins_raw:
        pinner = UserRepository.get_user_by_id(session, pin.pinned_by)
        pin_dict = pin.dict()
        pin_dict["pinned_by_name"] = pinner.name if pinner else None
        result.append(pin_dict)
    return result

@router.delete("/pins/{pin_id}")
def unpin_product(pin_id: int, session: Session = Depends(get_session)):
    pin = OutfitCircleRepository.get_pin_by_id(session, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    OutfitCircleRepository.delete_pin(session, pin)
    return {"detail": "unpinned"}


# ---------- Polls ----------

@router.post("/polls")
def create_poll(payload: CreatePollRequest, session: Session = Depends(get_session)):
    poll = OutfitCircleRepository.create_poll(
        session=session,
        pin_id=payload.pin_id,
        created_by=payload.created_by,
        question=payload.question,
        closes_at=payload.closes_at
    )

    options = []
    for label in payload.options:
        opt = OutfitCircleRepository.create_poll_option(session, poll.poll_id, label)
        options.append(opt)

    return {"poll": poll, "options": options}


@router.get("/pins/{pin_id}/poll")
def get_poll_for_pin(pin_id: int, session: Session = Depends(get_session)):
    poll = OutfitCircleRepository.get_poll_by_pin_id(session, pin_id)
    if not poll:
        raise HTTPException(status_code=404, detail="No poll for this pin")

    options = OutfitCircleRepository.get_poll_options_by_poll_id(session, poll.poll_id)

    result = []
    for opt in options:
        votes = OutfitCircleRepository.get_votes_by_option_id(session, opt.option_id)
        vote_count = len(votes)
        result.append({"option_id": opt.option_id, "label": opt.label, "votes": vote_count})

    return {"poll": poll, "options": result}


@router.post("/votes")
def cast_vote(payload: VoteRequest, session: Session = Depends(get_session)):
    existing = OutfitCircleRepository.get_vote_by_poll_and_user(session, payload.poll_id, payload.user_id)

    if existing:
        # allow changing vote instead of hard-blocking
        existing.option_id = payload.option_id
        existing.voted_at = datetime.utcnow()
        OutfitCircleRepository.save_vote(session, existing)
        return {"detail": "vote updated"}

    vote = PollVote(**payload.dict())
    OutfitCircleRepository.save_vote(session, vote)
    return {"detail": "vote cast"}

@router.post("/boards/{board_id}/members/by-phone/{phone}")
def add_member_by_phone(board_id: int, phone: str, session: Session = Depends(get_session)):
    normalized_phone = phone.strip()
    if not normalized_phone:
        raise HTTPException(status_code=400, detail="Phone is required")

    user = UserRepository.get_user_by_phone(session, normalized_phone)
    if not user:
        user = UserRepository.create_user(
            session=session,
            name=f"Guest {normalized_phone[-4:]}",
            phone=normalized_phone,
            password_hash="invite_pending_user"
        )

    existing = OutfitCircleRepository.get_board_member(session, board_id, user.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already invited or already in board")

    member = OutfitCircleRepository.create_board_member(
        session=session,
        board_id=board_id,
        user_id=user.user_id,
        role="member",
        invite_status="pending",
        accepted_at=None
    )
    return {"detail": "Invite sent", "member": member, "user": user}

@router.get("/users/by-phone/{phone}")
def get_user_by_phone(phone: str, session: Session = Depends(get_session)):
    normalized = phone.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Phone is required")

    user = UserRepository.get_user_by_phone(session, normalized)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user_id": user.user_id, "name": user.name, "phone": user.phone}


# ---------- Gully / Community Circles Endpoints ----------


class UpdatePinCanvasRequest(BaseModel):
    canvas_x: Optional[float] = None
    canvas_y: Optional[float] = None
    canvas_scale: Optional[float] = None
    canvas_z_index: Optional[int] = None


@router.put("/pins/{pin_id}/canvas")
def update_pin_canvas(pin_id: int, payload: UpdatePinCanvasRequest, session: Session = Depends(get_session)):
    """
    Update a pin's placement coordinates on the digital twin canvas.
    """
    pin = OutfitCircleRepository.get_pin_by_id(session, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    if payload.canvas_x is not None:
        pin.canvas_x = payload.canvas_x
    if payload.canvas_y is not None:
        pin.canvas_y = payload.canvas_y
    if payload.canvas_scale is not None:
        pin.canvas_scale = payload.canvas_scale
    if payload.canvas_z_index is not None:
        pin.canvas_z_index = payload.canvas_z_index

    OutfitCircleRepository.save_pin(session, pin)
    return pin