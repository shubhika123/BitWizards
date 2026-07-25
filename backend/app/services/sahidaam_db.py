import datetime
import random
import uuid
from typing import List, Dict, Any, Optional

from app.repository.sahidaam_repo import SahiDaamRepository, compute_confidence_score


def get_user_preferences(user_id: str) -> Dict[str, set]:
    return SahiDaamRepository.get_user_preferences(user_id)


def init_mock_db():
    SahiDaamRepository.init_mock_db()


def get_user_ledger(user_id: str) -> Dict[str, Any]:
    return SahiDaamRepository.get_user_ledger(user_id)


def _as_utc(dt: Optional[datetime.datetime]) -> Optional[datetime.datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.timezone.utc)
    return dt.astimezone(datetime.timezone.utc)


def update_streak(user_id: str):
    ledger = get_user_ledger(user_id)
    today = datetime.datetime.now(datetime.timezone.utc).date()
    last = ledger["last_played_date"]
    if isinstance(last, str):
        last = datetime.date.fromisoformat(last)

    if last == today:
        return  # Already played today, streak unchanged

    if last == today - datetime.timedelta(days=1):
        ledger["streak_count"] = min(ledger["streak_count"] + 1, 5)  # cap at 5
    else:
        ledger["streak_count"] = 1  # Reset or start new streak

    ledger["last_played_date"] = today
    SahiDaamRepository.save_user_ledger(ledger)


def expire_stale_cards(user_id: str):
    now = datetime.datetime.now(datetime.timezone.utc)
    deck_cards = SahiDaamRepository.get_deck_cards()
    for card in deck_cards.values():
        if card["user_id"] == user_id and card["status"] == "shown":
            shown_at = _as_utc(card.get("shown_at"))
            if shown_at is not None:
                elapsed = (now - shown_at).total_seconds()
                if elapsed > 65:  # 60s + 5s grace
                    card["status"] = "timed_out"
                    SahiDaamRepository.update_deck_card(card)


def get_today_deck(user_id: str) -> List[Dict[str, Any]]:
    init_mock_db()
    expire_stale_cards(user_id)

    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()

    daily_decks = SahiDaamRepository.get_daily_decks()
    deck_cards = SahiDaamRepository.get_deck_cards()
    challenge_items = SahiDaamRepository.get_challenge_items()

    # 1. Find or create today's deck
    deck_id = None
    for did, d in daily_decks.items():
        if d["user_id"] == user_id and d["date"] == today:
            deck_id = did
            break

    if not deck_id:
        deck_id = str(uuid.uuid4())
        SahiDaamRepository.add_daily_deck(
            deck_id,
            {
                "id": deck_id,
                "user_id": user_id,
                "date": today,
                "generated_at": datetime.datetime.now(datetime.timezone.utc),
            },
        )

    # 2. Count how many cards are played vs pending for this user today
    played_count = 0
    pending_cards = []
    already_in_deck = set()
    max_pos = -1

    for card in deck_cards.values():
        if card["deck_id"] == deck_id:
            already_in_deck.add(card["item_id"])
            if card["position"] > max_pos:
                max_pos = card["position"]

            if card["status"] in ["submitted", "dismissed"]:
                played_count += 1
            elif card["status"] == "pending":
                pending_cards.append(card)

    # 3. Check if we need to generate more cards to reach the limit of 5 PLAYED cards
    target_limit = 5
    needed = target_limit - played_count - len(pending_cards)

    if needed > 0:
        prefs = get_user_preferences(user_id)
        unrecommended = prefs["unrecommend"]

        items = [
            item
            for item in challenge_items.values()
            if item["id"] not in unrecommended and item["id"] not in already_in_deck
        ]
        random.shuffle(items)
        selected = items[:needed]

        for i, item in enumerate(selected):
            card_id = str(uuid.uuid4())
            new_card = {
                "id": card_id,
                "deck_id": deck_id,
                "user_id": user_id,
                "item_id": item["id"],
                "position": max_pos + 1 + i,
                "status": "pending",
                "shown_at": None,
                "submitted_at": None,
                "guess_amount": None,
                "deviation_pct": None,
                "base_points": None,
                "speed_bonus_points": None,
                "total_points": None,
                "swipe_action": None,
                "actual_price": item["actual_price"],
                "name": item["name"],
                "image_url": item["image_url"],
                "detail_tiers": item["detail_tiers"],
            }
            SahiDaamRepository.add_deck_card(card_id, new_card)
            pending_cards.append(new_card)

    pending_cards.sort(key=lambda x: x["position"])
    return pending_cards


def mark_card_shown(card_id: str, user_id: str) -> Optional[datetime.datetime]:
    expire_stale_cards(user_id)
    deck_cards = SahiDaamRepository.get_deck_cards()
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")

    if card["status"] == "pending":
        card["status"] = "shown"
        card["shown_at"] = datetime.datetime.now(datetime.timezone.utc)
        SahiDaamRepository.update_deck_card(card)
        return card["shown_at"]
    elif card["status"] == "shown":
        return card["shown_at"]
    else:
        raise ValueError("Card is no longer playable")


def tier_lookup(deviation_pct: float) -> int:
    if deviation_pct <= 0.05:
        return 100
    elif deviation_pct <= 0.15:
        return 60
    elif deviation_pct <= 0.30:
        return 25
    else:
        return 10


def speed_bonus_curve(elapsed_seconds: float) -> int:
    if elapsed_seconds <= 15:
        return 15
    elif elapsed_seconds <= 30:
        return 8
    elif elapsed_seconds <= 45:
        return 3
    return 0


def submit_card(
    card_id: str,
    user_id: str,
    guess_amount: float,
    *,
    slider_adjustments: int = 0,
    hesitation_seconds: Optional[float] = None,
) -> Dict[str, Any]:
    expire_stale_cards(user_id)
    deck_cards = SahiDaamRepository.get_deck_cards()
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")

    if card["status"] != "shown":
        raise ValueError("Card is not in a shown state")

    now = datetime.datetime.now(datetime.timezone.utc)
    shown_at = _as_utc(card["shown_at"])
    elapsed = (now - shown_at).total_seconds() if shown_at else 999

    actual_price = card["actual_price"]
    deviation_pct = abs(guess_amount - actual_price) / actual_price

    base_points = tier_lookup(deviation_pct)
    speed_bonus = speed_bonus_curve(elapsed)

    ledger = get_user_ledger(user_id)
    streak_multiplier = 1.0 + (ledger.get("streak_count", 0) * 0.10)

    total_points = round(base_points * streak_multiplier) + speed_bonus

    update_streak(user_id)
    ledger = get_user_ledger(user_id)
    ledger["points_balance"] = int(ledger.get("points_balance") or 0) + total_points
    SahiDaamRepository.save_user_ledger(ledger)

    card["status"] = "submitted"
    card["submitted_at"] = now
    card["guess_amount"] = guess_amount
    card["deviation_pct"] = deviation_pct
    card["base_points"] = base_points
    card["speed_bonus_points"] = speed_bonus
    card["total_points"] = total_points
    SahiDaamRepository.update_deck_card(card)

    brand_tier = next(
        (
            t
            for t in (card.get("detail_tiers") or [])
            if isinstance(t, dict) and t.get("label") == "Brand"
        ),
        None,
    )
    brand_name = brand_tier.get("value") if brand_tier else None
    brand_at = float(brand_tier.get("reveal_at_seconds") or 0) if brand_tier else None
    brand_revealed = bool(brand_tier and brand_at is not None and elapsed >= brand_at)

    adj = max(0, int(slider_adjustments or 0))
    hes = float(hesitation_seconds) if hesitation_seconds is not None else float(elapsed)
    hes = max(0.0, hes)
    confidence_score = compute_confidence_score(adj, hes)

    SahiDaamRepository.log_interaction(
        {
            "timestamp": now.isoformat(),
            "user_id": user_id,
            "card_id": card_id,
            "item_id": card["item_id"],
            "event_type": "submit_guess",
            "guess_amount": guess_amount,
            "deviation_pct": deviation_pct,
            "elapsed_seconds": round(elapsed, 1),
            "brand": brand_name,
            "brand_revealed": brand_revealed,
            "slider_adjustments": adj,
            "hesitation_seconds": round(hes, 1),
            "confidence_score": confidence_score,
        }
    )

    return {
        "actual_price": actual_price,
        "guess_amount": guess_amount,
        "deviation_pct": deviation_pct,
        "base_points": base_points,
        "speed_bonus_points": speed_bonus,
        "total_points": total_points,
        "streak_count": ledger["streak_count"],
        "social_proof_line": f"Closer than {random.randint(60, 95)}% of users in your city",
        "confidence_score": confidence_score,
    }


def swipe_card(card_id: str, user_id: str, action: str):
    deck_cards = SahiDaamRepository.get_deck_cards()
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")

    if card["status"] in ["pending", "shown"] and card["guess_amount"] is None:
        card["status"] = "dismissed"

    card["swipe_action"] = action
    SahiDaamRepository.update_deck_card(card)

    intent = "unknown"
    action_lower = action.lower()
    if action_lower in ("left", "wishlist"):
        intent = "wishlist"
    elif action_lower in ("right", "unrecommend"):
        intent = "unrecommend"
    elif action_lower in ["up", "down", "vertical", "dismiss"]:
        intent = "dismiss"

    prefs = get_user_preferences(user_id)
    if intent == "wishlist":
        prefs["wishlist"].add(card["item_id"])
    elif intent == "unrecommend":
        prefs["unrecommend"].add(card["item_id"])
    SahiDaamRepository.save_user_preferences(user_id, prefs)

    SahiDaamRepository.log_interaction(
        {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "user_id": user_id,
            "card_id": card_id,
            "item_id": card["item_id"],
            "event_type": "swipe",
            "action": action,
            "intent": intent,
        }
    )


def get_ppi_aggregates() -> List[Dict[str, Any]]:
    return SahiDaamRepository.get_ppi_aggregates()


# Backward-compatible module attribute used by API
class _PpiAggregatesProxy(list):
    def _refresh(self):
        self.clear()
        self.extend(SahiDaamRepository.get_ppi_aggregates())

    def __bool__(self):
        self._refresh()
        return list.__bool__(self)

    def __getitem__(self, index):
        self._refresh()
        return list.__getitem__(self, index)

    def __iter__(self):
        self._refresh()
        return list.__iter__(self)

    def __len__(self):
        self._refresh()
        return list.__len__(self)


ppi_aggregates = _PpiAggregatesProxy()
