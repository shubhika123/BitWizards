`# routers/outfit_circle.py
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


class RegisterUserRequest(BaseModel):
    username: str
    name: str


@router.post("/users/register")
def register_outfit_circle_user(payload: RegisterUserRequest, session: Session = Depends(get_session)):
    normalized_username = payload.username.strip()
    if not normalized_username:
        raise HTTPException(status_code=400, detail="Username is required")

    existing = session.exec(select(User).where(User.username == normalized_username)).first()

    if existing:
        # If this row was only a placeholder created earlier by someone inviting this
        # username before the person signed up, claim it instead of blocking registration.
        if existing.password_hash == "invite_pending_user":
            existing.name = payload.name
            existing.password_hash = "phone_auth_user"
            session.add(existing)
            session.commit()
            session.refresh(existing)
            return {"user_id": existing.user_id, "name": existing.name, "username": existing.username}
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        name=payload.name,
        username=normalized_username,
        password_hash="phone_auth_user",
        latitude=Decimal("0.00000000"),
        longitude=Decimal("0.00000000"),
        address=None,
        pincode=None,
        muted_festivals=None,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"user_id": user.user_id, "name": user.name, "username": user.username}

@router.post("/pins/{pin_id}/purchase")
def purchase_pin(pin_id: int, user_id: int = Body(..., embed=True), session: Session = Depends(get_session)):
    pin = session.get(PinnedProduct, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    existing = session.exec(
        select(PinPurchase).where(PinPurchase.pin_id == pin_id, PinPurchase.user_id == user_id)
    ).first()

    if not existing:
        session.add(PinPurchase(pin_id=pin_id, user_id=user_id))
        session.commit()

    purchases = session.exec(select(PinPurchase).where(PinPurchase.pin_id == pin_id)).all()

    result = []
    for p in purchases:
        buyer = session.get(User, p.user_id)
        result.append({"user_id": p.user_id, "user_name": buyer.name if buyer else None})

    return {"purchases": result}
# ---------- Board ----------

@router.post("/boards")
def create_board(payload: CreateBoardRequest, session: Session = Depends(get_session)):
    board = OutfitBoard(
        name=payload.name,
        created_by=payload.created_by,
        circle_type=payload.circle_type,
        city=payload.city,
        description=payload.description,
        creator_avatar_url=payload.creator_avatar_url
    )
    session.add(board)
    session.commit()
    session.refresh(board)

    # creator is always the board owner and is active immediately
    session.add(
        BoardMember(
            board_id=board.board_id,
            user_id=payload.created_by,
            role="admin",
            invite_status="accepted",
            accepted_at=datetime.utcnow(),
        )
    )

    # invite other members first; they must accept later
    for uid in payload.member_ids:
        session.add(
            BoardMember(
                board_id=board.board_id,
                user_id=uid,
                role="member",
                invite_status="pending",
                accepted_at=None,
            )
        )
    session.commit()

    return board


from app.models.FestivalSchema import User  # or wherever User model is

@router.get("/boards/{board_id}")
def get_board(board_id: int, session: Session = Depends(get_session)):
    board = session.get(OutfitBoard, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    statement = (
        select(BoardMember, User.name, User.username)
        .join(User, User.user_id == BoardMember.user_id)
        .where(BoardMember.board_id == board_id)
    )
    rows = session.exec(statement).all()
    members = [
        {
            "user_id": m.user_id,
            "role": m.role,
            "name": name,
            "username": username,
            "city": getattr(m, "city", None),
            "invite_status": m.invite_status,
            "joined_at": m.joined_at,
            "accepted_at": m.accepted_at,
        }
        for m, name, username in rows
    ]

    pins_raw = session.exec(select(PinnedProduct).where(PinnedProduct.board_id == board_id)).all()

    pins = []
    for pin in pins_raw:
        pinner = session.get(User, pin.pinned_by)
        pin_dict = pin.dict()
        pin_dict["pinned_by_name"] = pinner.name if pinner else None
        pins.append(pin_dict)

    return {"board": board, "members": members, "pins": pins}


@router.get("/users/{user_id}/boards")
def get_user_boards(user_id: int, session: Session = Depends(get_session)):
    statement = (
        select(OutfitBoard)
        .join(BoardMember, BoardMember.board_id == OutfitBoard.board_id)
        .where(BoardMember.user_id == user_id)
    )
    return session.exec(statement).all()


@router.post("/boards/{board_id}/members/{user_id}")
def add_member(board_id: int, user_id: int, session: Session = Depends(get_session)):
    existing = session.exec(
        select(BoardMember).where(BoardMember.board_id == board_id, BoardMember.user_id == user_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already in board")

    member = BoardMember(
        board_id=board_id,
        user_id=user_id,
        role="member",
        invite_status="pending",
        accepted_at=None,
    )
    session.add(member)
    session.commit()
    session.refresh(member)
    return member


@router.post("/boards/{board_id}/members/{user_id}/accept")
def accept_member_invite(
    board_id: int,
    user_id: int,
    session: Session = Depends(get_session),
    x_user_username: Optional[str] = Header(default=None, alias="X-User-Username"),
):
    member = session.exec(
        select(BoardMember).where(BoardMember.board_id == board_id, BoardMember.user_id == user_id)
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Invite not found")

    invited_user = session.get(User, user_id)
    if not invited_user:
        raise HTTPException(status_code=404, detail="Invited user not found")

    if not x_user_username or invited_user.username != x_user_username.strip():
        raise HTTPException(status_code=403, detail="Only the invited user can accept this invite")

    if member.invite_status == "accepted":
        return {"detail": "Invite already accepted", "member": member}

    member.invite_status = "accepted"
    member.accepted_at = datetime.utcnow()
    session.add(member)
    session.commit()
    session.refresh(member)
    return {"detail": "Invite accepted", "member": member}


# ---------- Pins ----------

@router.post("/pins")
def pin_product(payload: PinProductRequest, session: Session = Depends(get_session)):
    pin = PinnedProduct(**payload.dict())
    session.add(pin)
    session.commit()
    session.refresh(pin)
    return pin

@router.get("/boards/{board_id}/pins")
def get_board_pins(board_id: int, session: Session = Depends(get_session)):
    pins_raw = session.exec(select(PinnedProduct).where(PinnedProduct.board_id == board_id)).all()
    result = []
    for pin in pins_raw:
        pinner = session.get(User, pin.pinned_by)
        pin_dict = pin.dict()
        pin_dict["pinned_by_name"] = pinner.name if pinner else None
        result.append(pin_dict)
    return result

@router.delete("/pins/{pin_id}")
def unpin_product(pin_id: int, session: Session = Depends(get_session)):
    pin = session.get(PinnedProduct, pin_id)
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    session.delete(pin)
    session.commit()
    return {"detail": "unpinned"}


# ---------- Polls ----------

@router.post("/polls")
def create_poll(payload: CreatePollRequest, session: Session = Depends(get_session)):
    poll = Poll(
        pin_id=payload.pin_id,
        created_by=payload.created_by,
        question=payload.question,
        closes_at=payload.closes_at,
    )
    session.add(poll)
    session.commit()
    session.refresh(poll)

    options = []
    for label in payload.options:
        opt = PollOption(poll_id=poll.poll_id, label=label)
        session.add(opt)
        options.append(opt)
    session.commit()

    return {"poll": poll, "options": options}


@router.get("/pins/{pin_id}/poll")
def get_poll_for_pin(pin_id: int, session: Session = Depends(get_session)):
    poll = session.exec(select(Poll).where(Poll.pin_id == pin_id)).first()
    if not poll:
        raise HTTPException(status_code=404, detail="No poll for this pin")

    options = session.exec(select(PollOption).where(PollOption.poll_id == poll.poll_id)).all()

    result = []
    for opt in options:
        vote_count = len(
            session.exec(select(PollVote).where(PollVote.option_id == opt.option_id)).all()
        )
        result.append({"option_id": opt.option_id, "label": opt.label, "votes": vote_count})

    return {"poll": poll, "options": result}


@router.post("/votes")
def cast_vote(payload: VoteRequest, session: Session = Depends(get_session)):
    existing = session.exec(
        select(PollVote).where(PollVote.poll_id == payload.poll_id, PollVote.user_id == payload.user_id)
    ).first()

    if existing:
        # allow changing vote instead of hard-blocking
        existing.option_id = payload.option_id
        existing.voted_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        return {"detail": "vote updated"}

    vote = PollVote(**payload.dict())
    session.add(vote)
    session.commit()
    return {"detail": "vote cast"}

@router.post("/boards/{board_id}/members/by-username/{username}")
def add_member_by_username(board_id: int, username: str, session: Session = Depends(get_session)):
    normalized_username = username.strip()
    if not normalized_username:
        raise HTTPException(status_code=400, detail="Username is required")

    user = session.exec(select(User).where(User.username == normalized_username)).first()
    if not user:
        user = User(
            name=normalized_username,
            username=normalized_username,
            password_hash="invite_pending_user",
            latitude=Decimal("0.00000000"),
            longitude=Decimal("0.00000000"),
            address=None,
            pincode=None,
            muted_festivals=None,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    existing = session.exec(
        select(BoardMember).where(BoardMember.board_id == board_id, BoardMember.user_id == user.user_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already invited or already in board")

    member = BoardMember(
        board_id=board_id,
        user_id=user.user_id,
        role="member",
        invite_status="pending",
        accepted_at=None,
    )
    session.add(member)
    session.commit()
    session.refresh(member)
    return {"detail": "Invite sent", "member": member, "user": user}

@router.get("/users/by-username/{username}")
def get_user_by_username(username: str, session: Session = Depends(get_session)):
    normalized = username.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Username is required")

    user = session.exec(select(User).where(User.username == normalized)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user_id": user.user_id, "name": user.name, "username": user.username}


# ---------- Gully / Community Circles Endpoints ----------

@router.get("/boards/gully")
def get_gully_boards(city: Optional[str] = None, session: Session = Depends(get_session)):
    """
    Retrieve all gully/community/creator circles. Optionally filters by city.
    """
    query = select(OutfitBoard).where(OutfitBoard.circle_type != "classic")
    if city:
        query = query.where(OutfitBoard.city == city)
    
    boards = session.exec(query).all()
    result = []
    
    for b in boards:
        creator = session.get(User, b.created_by)
        member_count = len(session.exec(select(BoardMember).where(BoardMember.board_id == b.board_id)).all())
        pin_count = len(session.exec(select(PinnedProduct).where(PinnedProduct.board_id == b.board_id)).all())
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
    pin = session.get(PinnedProduct, pin_id)
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

    session.add(pin)
    session.commit()
    session.refresh(pin)
    return pin