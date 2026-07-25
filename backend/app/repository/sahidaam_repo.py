from __future__ import annotations

import datetime
import random
import uuid
from typing import Any, Dict, List, Optional, Set

from sqlmodel import Session, select, col, func, delete

from app.database import engine
from app.services.database import CATALOG
from app.models.SahiDaamSchema import (
    SahiDaamChallengeItem,
    SahiDaamDailyDeck,
    SahiDaamDeckCard,
    SahiDaamUserLedger,
    SahiDaamUserPreferences,
    SahiDaamInteraction,
    SahiDaamPpiAggregate,
)

ASSORTMENT_SIZE = 8
BRAND_REVEAL_SECONDS = 12


def compute_confidence_score(slider_adjustments: int, hesitation_seconds: float) -> int:
    """0–100: fewer tweaks + less freeze time → higher confidence."""
    adj_penalty = min(50, max(0, int(slider_adjustments)) * 5)
    hes_penalty = min(50, max(0.0, float(hesitation_seconds)) * 1.25)
    return int(max(0, min(100, round(100 - adj_penalty - hes_penalty))))


def build_detail_tiers(item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Meaningful progressive reveals — Brand first when present; never Category/Gender."""
    style = ", ".join((item.get("aesthetic_tags") or [])[:2]) or "everyday"
    occasions = item.get("occasions") or []
    occasion = ", ".join(occasions[:2]) if occasions else ""
    colors = item.get("colors") or []
    color = ", ".join(colors[:2]) if colors else "mixed"
    brand = item.get("brand")

    if brand:
        return [
            {"reveal_at_seconds": BRAND_REVEAL_SECONDS, "label": "Brand", "value": brand},
            {"reveal_at_seconds": 25, "label": "Style", "value": style},
            {
                "reveal_at_seconds": 40,
                "label": "Occasion",
                "value": occasion or color,
            },
        ]

    tiers = [
        {"reveal_at_seconds": 12, "label": "Style", "value": style},
    ]
    if occasion:
        tiers.append({"reveal_at_seconds": 25, "label": "Occasion", "value": occasion})
        tiers.append({"reveal_at_seconds": 40, "label": "Color", "value": color})
    else:
        tiers.append({"reveal_at_seconds": 25, "label": "Color", "value": color})
        tiers.append(
            {
                "reveal_at_seconds": 40,
                "label": "Occasion",
                "value": "everyday",
            }
        )
    return tiers


def _tiers_are_stale(items: List[SahiDaamChallengeItem]) -> bool:
    """True if assortment uses old Category/Gender chips or lacks Brand where catalog has it."""
    if not items:
        return False
    catalog_by_id = {p["id"]: p for p in CATALOG}
    has_any_brand_tier = False
    for row in items:
        tiers = row.detail_tiers or []
        labels = {t.get("label") for t in tiers if isinstance(t, dict)}
        if "Category" in labels or "Gender" in labels:
            return True
        if "Brand" in labels:
            has_any_brand_tier = True
        product = catalog_by_id.get(row.product_id or "")
        if product and product.get("brand") and "Brand" not in labels:
            return True
    # Assortment should include at least one branded SKU once catalog has brands
    branded_in_catalog = any(p.get("brand") for p in CATALOG)
    if branded_in_catalog and not has_any_brand_tier:
        return True
    return False


def _item_to_dict(row: SahiDaamChallengeItem) -> Dict[str, Any]:
    return {
        "id": row.id,
        "product_id": row.product_id,
        "actual_price": row.actual_price,
        "category": row.category,
        "detail_tiers": row.detail_tiers or [],
        "image_url": row.image_url,
        "name": row.name,
    }


def _deck_to_dict(row: SahiDaamDailyDeck) -> Dict[str, Any]:
    return {
        "id": row.id,
        "user_id": row.user_id,
        "date": row.date,
        "generated_at": row.generated_at,
    }


def _card_to_dict(row: SahiDaamDeckCard) -> Dict[str, Any]:
    return {
        "id": row.id,
        "deck_id": row.deck_id,
        "user_id": row.user_id,
        "item_id": row.item_id,
        "position": row.position,
        "status": row.status,
        "shown_at": row.shown_at,
        "submitted_at": row.submitted_at,
        "guess_amount": row.guess_amount,
        "deviation_pct": row.deviation_pct,
        "base_points": row.base_points,
        "speed_bonus_points": row.speed_bonus_points,
        "total_points": row.total_points,
        "swipe_action": row.swipe_action,
        "actual_price": row.actual_price,
        "name": row.name,
        "image_url": row.image_url,
        "detail_tiers": row.detail_tiers or [],
    }


def _ledger_to_dict(row: SahiDaamUserLedger) -> Dict[str, Any]:
    return {
        "user_id": row.user_id,
        "points_balance": row.points_balance,
        "streak_count": row.streak_count,
        "last_played_date": row.last_played_date,
    }


def _apply_card_dict(row: SahiDaamDeckCard, data: Dict[str, Any]) -> None:
    row.deck_id = data["deck_id"]
    row.user_id = data["user_id"]
    row.item_id = data["item_id"]
    row.position = int(data.get("position") or 0)
    row.status = data.get("status") or "pending"
    row.shown_at = data.get("shown_at")
    row.submitted_at = data.get("submitted_at")
    row.guess_amount = data.get("guess_amount")
    row.deviation_pct = data.get("deviation_pct")
    row.base_points = data.get("base_points")
    row.speed_bonus_points = data.get("speed_bonus_points")
    row.total_points = data.get("total_points")
    row.swipe_action = data.get("swipe_action")
    row.actual_price = float(data["actual_price"])
    row.name = data.get("name")
    row.image_url = data.get("image_url")
    row.detail_tiers = data.get("detail_tiers") or []


class SahiDaamRepository:
    """SQL-backed Sahi Daam repository (Postgres / SQLite via shared engine)."""

    @staticmethod
    def get_challenge_items() -> Dict[str, Any]:
        with Session(engine) as session:
            rows = session.exec(select(SahiDaamChallengeItem)).all()
            return {r.id: _item_to_dict(r) for r in rows}

    @staticmethod
    def set_challenge_items(items: Dict[str, Any]) -> None:
        with Session(engine) as session:
            for item_id, data in items.items():
                row = session.get(SahiDaamChallengeItem, item_id)
                if row is None:
                    row = SahiDaamChallengeItem(id=item_id)
                    session.add(row)
                row.product_id = data.get("product_id")
                row.actual_price = float(data["actual_price"])
                row.category = data.get("category")
                row.name = data.get("name")
                row.image_url = data.get("image_url")
                row.detail_tiers = data.get("detail_tiers") or []
            session.commit()

    @staticmethod
    def get_daily_decks() -> Dict[str, Any]:
        with Session(engine) as session:
            rows = session.exec(select(SahiDaamDailyDeck)).all()
            return {r.id: _deck_to_dict(r) for r in rows}

    @staticmethod
    def add_daily_deck(deck_id: str, deck_data: Dict[str, Any]) -> None:
        with Session(engine) as session:
            row = session.get(SahiDaamDailyDeck, deck_id)
            if row is None:
                row = SahiDaamDailyDeck(id=deck_id)
                session.add(row)
            row.user_id = deck_data["user_id"]
            row.date = deck_data["date"]
            generated = deck_data.get("generated_at") or datetime.datetime.now(datetime.timezone.utc)
            if getattr(generated, "tzinfo", None) is not None:
                generated = generated.replace(tzinfo=None)
            row.generated_at = generated
            session.commit()

    @staticmethod
    def get_deck_cards() -> Dict[str, Any]:
        with Session(engine) as session:
            rows = session.exec(select(SahiDaamDeckCard)).all()
            return {r.id: _card_to_dict(r) for r in rows}

    @staticmethod
    def add_deck_card(card_id: str, card_data: Dict[str, Any]) -> None:
        with Session(engine) as session:
            row = session.get(SahiDaamDeckCard, card_id)
            if row is None:
                row = SahiDaamDeckCard(id=card_id, actual_price=float(card_data["actual_price"]))
                session.add(row)
            _apply_card_dict(row, {**card_data, "id": card_id})
            # Strip tz for SQLite-friendly naive datetimes
            if row.shown_at is not None and getattr(row.shown_at, "tzinfo", None):
                row.shown_at = row.shown_at.replace(tzinfo=None)
            if row.submitted_at is not None and getattr(row.submitted_at, "tzinfo", None):
                row.submitted_at = row.submitted_at.replace(tzinfo=None)
            session.commit()

    @staticmethod
    def update_deck_card(card_data: Dict[str, Any]) -> None:
        card_id = card_data["id"]
        SahiDaamRepository.add_deck_card(card_id, card_data)

    @staticmethod
    def get_user_ledger(user_id: str) -> Dict[str, Any]:
        with Session(engine) as session:
            row = session.get(SahiDaamUserLedger, user_id)
            if row is None:
                row = SahiDaamUserLedger(
                    user_id=user_id,
                    points_balance=0,
                    streak_count=0,
                    last_played_date=None,
                )
                session.add(row)
                session.commit()
                session.refresh(row)
            return _ledger_to_dict(row)

    @staticmethod
    def save_user_ledger(ledger: Dict[str, Any]) -> None:
        with Session(engine) as session:
            user_id = ledger["user_id"]
            row = session.get(SahiDaamUserLedger, user_id)
            if row is None:
                row = SahiDaamUserLedger(user_id=user_id)
                session.add(row)
            row.points_balance = int(ledger.get("points_balance") or 0)
            row.streak_count = int(ledger.get("streak_count") or 0)
            last = ledger.get("last_played_date")
            if isinstance(last, str):
                last = datetime.date.fromisoformat(last)
            row.last_played_date = last
            session.commit()

    @staticmethod
    def get_user_preferences(user_id: str) -> Dict[str, Set[str]]:
        with Session(engine) as session:
            row = session.get(SahiDaamUserPreferences, user_id)
            if row is None:
                row = SahiDaamUserPreferences(user_id=user_id, wishlist=[], unrecommend=[])
                session.add(row)
                session.commit()
                session.refresh(row)
            return {
                "wishlist": set(row.wishlist or []),
                "unrecommend": set(row.unrecommend or []),
            }

    @staticmethod
    def save_user_preferences(user_id: str, prefs: Dict[str, Set[str]]) -> None:
        with Session(engine) as session:
            row = session.get(SahiDaamUserPreferences, user_id)
            if row is None:
                row = SahiDaamUserPreferences(user_id=user_id)
                session.add(row)
            row.wishlist = list(prefs.get("wishlist") or [])
            row.unrecommend = list(prefs.get("unrecommend") or [])
            session.commit()

    @staticmethod
    def log_interaction(log_entry: Dict[str, Any]) -> None:
        ts = log_entry.get("timestamp")
        if isinstance(ts, str):
            try:
                ts = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except ValueError:
                ts = datetime.datetime.utcnow()
        if ts is None:
            ts = datetime.datetime.utcnow()
        if getattr(ts, "tzinfo", None) is not None:
            ts = ts.replace(tzinfo=None)

        payload = {
            k: v
            for k, v in log_entry.items()
            if k not in {"timestamp", "user_id", "card_id", "item_id", "event_type"}
        }

        with Session(engine) as session:
            session.add(
                SahiDaamInteraction(
                    timestamp=ts,
                    user_id=str(log_entry.get("user_id") or ""),
                    card_id=log_entry.get("card_id"),
                    item_id=log_entry.get("item_id"),
                    event_type=str(log_entry.get("event_type") or "unknown"),
                    payload=payload or None,
                )
            )
            session.commit()

    @staticmethod
    def get_interactions(limit: int = 5000) -> List[Dict[str, Any]]:
        with Session(engine) as session:
            rows = session.exec(
                select(SahiDaamInteraction).order_by(col(SahiDaamInteraction.id).desc()).limit(limit)
            ).all()
            out: List[Dict[str, Any]] = []
            for r in rows:
                entry = {
                    "id": r.id,
                    "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                    "user_id": r.user_id,
                    "card_id": r.card_id,
                    "item_id": r.item_id,
                    "event_type": r.event_type,
                }
                if r.payload:
                    entry.update(r.payload)
                out.append(entry)
            return out

    @staticmethod
    def count_interactions() -> int:
        with Session(engine) as session:
            return int(session.exec(select(func.count()).select_from(SahiDaamInteraction)).one())

    @staticmethod
    def get_ppi_aggregates() -> List[Dict[str, Any]]:
        with Session(engine) as session:
            rows = session.exec(select(SahiDaamPpiAggregate)).all()
            return [
                {
                    "category": r.category,
                    "region": r.region,
                    "age_band": r.age_band,
                    "gender": r.gender,
                    "median_ppi": r.median_ppi,
                    "sample_size": r.sample_size,
                    "computed_at": r.computed_at,
                }
                for r in rows
            ]

    @staticmethod
    def _clear_play_state() -> Dict[str, int]:
        """Wipe decks/cards/ledgers/prefs/challenge items; keep interactions."""
        with Session(engine) as session:
            cleared = {
                "daily_decks": session.exec(select(func.count()).select_from(SahiDaamDailyDeck)).one(),
                "deck_cards": session.exec(select(func.count()).select_from(SahiDaamDeckCard)).one(),
                "ledgers": session.exec(select(func.count()).select_from(SahiDaamUserLedger)).one(),
                "preferences": session.exec(select(func.count()).select_from(SahiDaamUserPreferences)).one(),
                "interactions_kept": session.exec(select(func.count()).select_from(SahiDaamInteraction)).one(),
            }
            session.exec(delete(SahiDaamDeckCard))
            session.exec(delete(SahiDaamDailyDeck))
            session.exec(delete(SahiDaamUserLedger))
            session.exec(delete(SahiDaamUserPreferences))
            session.exec(delete(SahiDaamChallengeItem))
            session.commit()
        return {k: int(v) for k, v in cleared.items()}

    @staticmethod
    def reset_all_game_data(*, reseed_demo: bool = True) -> Dict[str, int]:
        """
        Clears play state for every user. Interaction log is preserved.
        Challenge catalog is rebuilt; demo submissions reseeded when requested.
        """
        cleared = SahiDaamRepository._clear_play_state()
        SahiDaamRepository.init_mock_db(force_demo=reseed_demo)
        if not reseed_demo:
            with Session(engine) as session:
                session.exec(delete(SahiDaamDeckCard))
                session.exec(delete(SahiDaamDailyDeck))
                session.commit()
        return cleared

    @staticmethod
    def _seed_challenge_assortment(session: Session) -> None:
        """Insert a fresh 8-product assortment with current detail_tiers."""
        branded = [p for p in CATALOG if p.get("brand")]
        unbranded = [p for p in CATALOG if not p.get("brand")]
        random.shuffle(branded)
        random.shuffle(unbranded)
        # Prefer ~half branded so familiarity demos have Brand chips
        n_branded = min(4, len(branded), ASSORTMENT_SIZE)
        selected = branded[:n_branded] + unbranded[: ASSORTMENT_SIZE - n_branded]
        if len(selected) < ASSORTMENT_SIZE:
            pool = [p for p in CATALOG if p not in selected]
            random.shuffle(pool)
            selected.extend(pool[: ASSORTMENT_SIZE - len(selected)])
        random.shuffle(selected)
        for item in selected[:ASSORTMENT_SIZE]:
            session.add(
                SahiDaamChallengeItem(
                    id=str(uuid.uuid4()),
                    product_id=item["id"],
                    actual_price=float(item["price"]),
                    category=item.get("category"),
                    detail_tiers=build_detail_tiers(item),
                    image_url=item.get("image_url"),
                    name=item.get("name"),
                )
            )

    @staticmethod
    def init_mock_db(*, force_demo: bool = False) -> None:
        """Ensure assortment + PPI + demo guesses; reseed if tiers are stale."""
        with Session(engine) as session:
            items = list(session.exec(select(SahiDaamChallengeItem)).all())
            stale = bool(items) and _tiers_are_stale(items)

        if stale:
            SahiDaamRepository._clear_play_state()
            force_demo = True

        with Session(engine) as session:
            item_count = session.exec(select(func.count()).select_from(SahiDaamChallengeItem)).one()
            if not item_count:
                SahiDaamRepository._seed_challenge_assortment(session)
                force_demo = True

            ppi_count = session.exec(select(func.count()).select_from(SahiDaamPpiAggregate)).one()
            if not ppi_count:
                session.add(
                    SahiDaamPpiAggregate(
                        category="Topwear",
                        region="North",
                        age_band="18-24",
                        gender="Unisex",
                        median_ppi=1.15,
                        sample_size=1240,
                        computed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    )
                )
            session.commit()

        SahiDaamRepository._seed_demo_submissions(force=force_demo)

    @staticmethod
    def _seed_demo_submissions(*, force: bool = False) -> None:
        """Seed submitted over/under-guesses including pre/post brand unlock pairs."""
        seeded_logs: List[Dict[str, Any]] = []

        with Session(engine) as session:
            submitted = session.exec(
                select(func.count())
                .select_from(SahiDaamDeckCard)
                .where(SahiDaamDeckCard.status == "submitted")
            ).one()
            if submitted and not force:
                pass
            else:
                if force and submitted:
                    session.exec(delete(SahiDaamDeckCard))
                    session.exec(delete(SahiDaamDailyDeck))
                    session.commit()

                items = list(session.exec(select(SahiDaamChallengeItem)).all())
                if not items:
                    return

                now = datetime.datetime.utcnow()
                today = now.date().isoformat()
                demo_user = "demo_seed_user"
                deck_id = str(uuid.uuid4())
                session.add(
                    SahiDaamDailyDeck(
                        id=deck_id,
                        user_id=demo_user,
                        date=today,
                        generated_at=now,
                    )
                )

                # Mix of high / mid / low confidence profiles: (adjustments, hesitation)
                confidence_profiles = [
                    (1, 2.0),
                    (2, 4.0),
                    (3, 8.0),
                    (5, 12.0),
                    (8, 18.0),
                    (12, 28.0),
                    (0, 1.5),
                    (4, 6.0),
                    (6, 15.0),
                    (9, 22.0),
                    (2, 3.0),
                    (7, 10.0),
                    (3, 5.0),
                    (11, 35.0),
                    (1, 7.0),
                    (5, 9.0),
                    (4, 14.0),
                    (8, 20.0),
                ]
                profile_i = 0

                def _queue_log(
                    *,
                    card_id: str,
                    user_id: str,
                    item_id: str,
                    guess_amount: float,
                    deviation_pct: float,
                    elapsed_s: float,
                    timestamp: datetime.datetime,
                ) -> None:
                    nonlocal profile_i
                    adj, hes = confidence_profiles[profile_i % len(confidence_profiles)]
                    profile_i += 1
                    seeded_logs.append(
                        {
                            "timestamp": timestamp.isoformat(),
                            "user_id": user_id,
                            "card_id": card_id,
                            "item_id": item_id,
                            "event_type": "submit_guess",
                            "guess_amount": guess_amount,
                            "deviation_pct": deviation_pct,
                            "elapsed_seconds": round(elapsed_s, 1),
                            "slider_adjustments": adj,
                            "hesitation_seconds": hes,
                            "confidence_score": compute_confidence_score(adj, hes),
                        }
                    )

                position = 0
                guess_multipliers = [1.25, 1.18, 1.12, 0.82, 0.75, 0.88]
                for i, item in enumerate(items[:6]):
                    shown_at = now - datetime.timedelta(minutes=30 - i)
                    elapsed_s = 20 + i * 3
                    submitted_at = shown_at + datetime.timedelta(seconds=elapsed_s)
                    mult = guess_multipliers[i % len(guess_multipliers)]
                    guess_amount = round(item.actual_price * mult, 1)
                    deviation_pct = abs(guess_amount - item.actual_price) / item.actual_price
                    card_id = str(uuid.uuid4())
                    session.add(
                        SahiDaamDeckCard(
                            id=card_id,
                            deck_id=deck_id,
                            user_id=demo_user,
                            item_id=item.id,
                            position=position,
                            status="submitted",
                            shown_at=shown_at,
                            submitted_at=submitted_at,
                            guess_amount=guess_amount,
                            deviation_pct=deviation_pct,
                            base_points=60,
                            speed_bonus_points=8,
                            total_points=74,
                            swipe_action=None,
                            actual_price=item.actual_price,
                            name=item.name,
                            image_url=item.image_url,
                            detail_tiers=item.detail_tiers or [],
                        )
                    )
                    _queue_log(
                        card_id=card_id,
                        user_id=demo_user,
                        item_id=item.id,
                        guess_amount=guess_amount,
                        deviation_pct=deviation_pct,
                        elapsed_s=elapsed_s,
                        timestamp=submitted_at,
                    )
                    position += 1

                branded_items = [
                    it
                    for it in items
                    if any(
                        isinstance(t, dict) and t.get("label") == "Brand"
                        for t in (it.detail_tiers or [])
                    )
                ]
                for j, item in enumerate(branded_items[:3]):
                    brand_at = BRAND_REVEAL_SECONDS
                    for k, (elapsed_s, mult) in enumerate(
                        [
                            (brand_at - 5, 1.35),
                            (brand_at - 3, 0.65),
                        ]
                    ):
                        shown_at = now - datetime.timedelta(minutes=5, seconds=j * 20 + k)
                        submitted_at = shown_at + datetime.timedelta(seconds=elapsed_s)
                        guess_amount = round(item.actual_price * mult, 1)
                        deviation_pct = abs(guess_amount - item.actual_price) / item.actual_price
                        card_id = str(uuid.uuid4())
                        session.add(
                            SahiDaamDeckCard(
                                id=card_id,
                                deck_id=deck_id,
                                user_id=f"demo_pre_brand_{j}",
                                item_id=item.id,
                                position=position,
                                status="submitted",
                                shown_at=shown_at,
                                submitted_at=submitted_at,
                                guess_amount=guess_amount,
                                deviation_pct=deviation_pct,
                                base_points=40,
                                speed_bonus_points=15,
                                total_points=55,
                                swipe_action=None,
                                actual_price=item.actual_price,
                                name=item.name,
                                image_url=item.image_url,
                                detail_tiers=item.detail_tiers or [],
                            )
                        )
                        _queue_log(
                            card_id=card_id,
                            user_id=f"demo_pre_brand_{j}",
                            item_id=item.id,
                            guess_amount=guess_amount,
                            deviation_pct=deviation_pct,
                            elapsed_s=elapsed_s,
                            timestamp=submitted_at,
                        )
                        position += 1
                    for k, (elapsed_s, mult) in enumerate(
                        [
                            (brand_at + 8, 1.08),
                            (brand_at + 15, 0.94),
                        ]
                    ):
                        shown_at = now - datetime.timedelta(minutes=4, seconds=j * 20 + k)
                        submitted_at = shown_at + datetime.timedelta(seconds=elapsed_s)
                        guess_amount = round(item.actual_price * mult, 1)
                        deviation_pct = abs(guess_amount - item.actual_price) / item.actual_price
                        card_id = str(uuid.uuid4())
                        session.add(
                            SahiDaamDeckCard(
                                id=card_id,
                                deck_id=deck_id,
                                user_id=f"demo_post_brand_{j}",
                                item_id=item.id,
                                position=position,
                                status="submitted",
                                shown_at=shown_at,
                                submitted_at=submitted_at,
                                guess_amount=guess_amount,
                                deviation_pct=deviation_pct,
                                base_points=80,
                                speed_bonus_points=5,
                                total_points=85,
                                swipe_action=None,
                                actual_price=item.actual_price,
                                name=item.name,
                                image_url=item.image_url,
                                detail_tiers=item.detail_tiers or [],
                            )
                        )
                        _queue_log(
                            card_id=card_id,
                            user_id=f"demo_post_brand_{j}",
                            item_id=item.id,
                            guess_amount=guess_amount,
                            deviation_pct=deviation_pct,
                            elapsed_s=elapsed_s,
                            timestamp=submitted_at,
                        )
                        position += 1

                session.commit()

        for entry in seeded_logs:
            SahiDaamRepository.log_interaction(entry)

        SahiDaamRepository._seed_confidence_interactions_if_missing()

    @staticmethod
    def _seed_confidence_interactions_if_missing() -> None:
        """If no submit_guess rows carry confidence_score, synthesize from existing submitted cards."""
        interactions = SahiDaamRepository.get_interactions(limit=2000)
        has_confidence = any(
            e.get("event_type") == "submit_guess" and e.get("confidence_score") is not None
            for e in interactions
        )
        if has_confidence:
            return

        cards = [
            c
            for c in SahiDaamRepository.get_deck_cards().values()
            if c.get("status") == "submitted"
        ]
        if not cards:
            return

        profiles = [
            (1, 2.0),
            (3, 8.0),
            (5, 12.0),
            (8, 18.0),
            (2, 4.0),
            (10, 25.0),
            (0, 1.5),
            (6, 15.0),
            (4, 9.0),
            (12, 30.0),
        ]
        for i, card in enumerate(cards):
            adj, hes = profiles[i % len(profiles)]
            ts = card.get("submitted_at") or datetime.datetime.utcnow()
            if hasattr(ts, "isoformat"):
                ts_str = ts.isoformat()
            else:
                ts_str = str(ts)
            SahiDaamRepository.log_interaction(
                {
                    "timestamp": ts_str,
                    "user_id": card.get("user_id") or "demo_seed_user",
                    "card_id": card.get("id"),
                    "item_id": card.get("item_id"),
                    "event_type": "submit_guess",
                    "guess_amount": card.get("guess_amount"),
                    "deviation_pct": card.get("deviation_pct"),
                    "slider_adjustments": adj,
                    "hesitation_seconds": hes,
                    "confidence_score": compute_confidence_score(adj, hes),
                }
            )
