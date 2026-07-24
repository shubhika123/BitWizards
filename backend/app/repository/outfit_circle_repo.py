from datetime import datetime
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlmodel import Session, select
from app.models.OutfitCircleSchema import OutfitBoard, BoardMember, PinnedProduct, Poll, PollOption, PollVote, PinPurchase
from app.models.UserSchema import User

class OutfitCircleRepository:

    @staticmethod
    def get_pin_by_id(session: Session, pin_id: int) -> Optional[PinnedProduct]:
        return session.get(PinnedProduct, pin_id)

    @staticmethod
    def get_pin_purchase(session: Session, pin_id: int, user_id: int) -> Optional[PinPurchase]:
        return session.exec(
            select(PinPurchase).where(PinPurchase.pin_id == pin_id, PinPurchase.user_id == user_id)
        ).first()

    @staticmethod
    def create_pin_purchase(session: Session, pin_id: int, user_id: int) -> PinPurchase:
        purchase = PinPurchase(pin_id=pin_id, user_id=user_id)
        session.add(purchase)
        session.commit()
        return purchase

    @staticmethod
    def get_purchases_by_pin_id(session: Session, pin_id: int) -> List[PinPurchase]:
        return session.exec(select(PinPurchase).where(PinPurchase.pin_id == pin_id)).all()

    @staticmethod
    def create_board(
        session: Session,
        name: str,
        created_by: int,
        circle_type: str,
        city: Optional[str],
        description: Optional[str],
        creator_avatar_url: Optional[str]
    ) -> OutfitBoard:
        board = OutfitBoard(
            name=name,
            created_by=created_by,
            circle_type=circle_type,
            city=city,
            description=description,
            creator_avatar_url=creator_avatar_url
        )
        session.add(board)
        session.commit()
        session.refresh(board)
        return board

    @staticmethod
    def create_board_member(
        session: Session,
        board_id: int,
        user_id: int,
        role: str,
        invite_status: str,
        accepted_at: Optional[datetime] = None
    ) -> BoardMember:
        member = BoardMember(
            board_id=board_id,
            user_id=user_id,
            role=role,
            invite_status=invite_status,
            accepted_at=accepted_at
        )
        session.add(member)
        session.commit()
        session.refresh(member)
        return member

    @staticmethod
    def get_board_by_id(session: Session, board_id: int) -> Optional[OutfitBoard]:
        return session.get(OutfitBoard, board_id)

    @staticmethod
    def get_board_members_with_user_details(session: Session, board_id: int) -> List[Tuple[BoardMember, str, str]]:
        statement = (
            select(BoardMember, User.name, User.username)
            .join(User, User.user_id == BoardMember.user_id)
            .where(BoardMember.board_id == board_id)
        )
        return session.exec(statement).all()

    @staticmethod
    def get_pins_by_board_id(session: Session, board_id: int) -> List[PinnedProduct]:
        return session.exec(select(PinnedProduct).where(PinnedProduct.board_id == board_id)).all()

    @staticmethod
    def get_boards_by_user_id(session: Session, user_id: int) -> List[OutfitBoard]:
        statement = (
            select(OutfitBoard)
            .join(BoardMember, BoardMember.board_id == OutfitBoard.board_id)
            .where(BoardMember.user_id == user_id)
        )
        return session.exec(statement).all()

    @staticmethod
    def get_board_member(session: Session, board_id: int, user_id: int) -> Optional[BoardMember]:
        return session.exec(
            select(BoardMember).where(BoardMember.board_id == board_id, BoardMember.user_id == user_id)
        ).first()

    @staticmethod
    def save_board_member(session: Session, member: BoardMember) -> BoardMember:
        session.add(member)
        session.commit()
        session.refresh(member)
        return member


    @staticmethod
    def create_pin(session: Session, payload_dict: dict) -> PinnedProduct:
        pin = PinnedProduct(**payload_dict)
        session.add(pin)
        session.commit()
        session.refresh(pin)
        return pin

    @staticmethod
    def save_pin(session: Session, pin: PinnedProduct) -> PinnedProduct:
        session.add(pin)
        session.commit()
        session.refresh(pin)
        return pin

    @staticmethod
    def delete_pin(session: Session, pin: PinnedProduct) -> None:
        session.delete(pin)
        session.commit()

    @staticmethod
    def create_poll(
        session: Session,
        pin_id: int,
        created_by: int,
        question: str,
        closes_at: Optional[datetime] = None
    ) -> Poll:
        poll = Poll(
            pin_id=pin_id,
            created_by=created_by,
            question=question,
            closes_at=closes_at
        )
        session.add(poll)
        session.commit()
        session.refresh(poll)
        return poll

    @staticmethod
    def create_poll_option(session: Session, poll_id: int, label: str) -> PollOption:
        opt = PollOption(poll_id=poll_id, label=label)
        session.add(opt)
        session.commit()
        return opt

    @staticmethod
    def get_poll_by_pin_id(session: Session, pin_id: int) -> Optional[Poll]:
        return session.exec(select(Poll).where(Poll.pin_id == pin_id)).first()

    @staticmethod
    def get_poll_options_by_poll_id(session: Session, poll_id: int) -> List[PollOption]:
        return session.exec(select(PollOption).where(PollOption.poll_id == poll_id)).all()

    @staticmethod
    def get_votes_by_option_id(session: Session, option_id: int) -> List[PollVote]:
        return session.exec(select(PollVote).where(PollVote.option_id == option_id)).all()

    @staticmethod
    def get_vote_by_poll_and_user(session: Session, poll_id: int, user_id: int) -> Optional[PollVote]:
        return session.exec(
            select(PollVote).where(PollVote.poll_id == poll_id, PollVote.user_id == user_id)
        ).first()

    @staticmethod
    def save_vote(session: Session, vote: PollVote) -> PollVote:
        session.add(vote)
        session.commit()
        return vote

    @staticmethod
    def create_vote(session: Session, poll_id: int, option_id: int, user_id: int) -> PollVote:
        vote = PollVote(poll_id=poll_id, option_id=option_id, user_id=user_id)
        session.add(vote)
        session.commit()
        return vote

    @staticmethod
    def get_gully_boards(session: Session, city: Optional[str] = None) -> List[OutfitBoard]:
        query = select(OutfitBoard).where(OutfitBoard.circle_type != "classic")
        if city:
            query = query.where(OutfitBoard.city == city)
        return session.exec(query).all()

    @staticmethod
    def get_board_member_count(session: Session, board_id: int) -> int:
        return len(session.exec(select(BoardMember).where(BoardMember.board_id == board_id)).all())

    @staticmethod
    def get_board_pin_count(session: Session, board_id: int) -> int:
        return len(session.exec(select(PinnedProduct).where(PinnedProduct.board_id == board_id)).all())
