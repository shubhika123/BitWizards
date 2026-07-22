import uuid
import datetime
import random
from typing import List, Dict, Any, Optional

from app.services.database import CATALOG

# In-memory stores (mock DB)
challenge_items: Dict[str, Any] = {}
daily_decks: Dict[str, Any] = {}
deck_cards: Dict[str, Any] = {}
user_reward_ledger: Dict[str, Any] = {}
ppi_aggregates: List[Dict[str, Any]] = [
    {
        "category": "Topwear",
        "region": "North",
        "age_band": "18-24",
        "gender": "Unisex",
        "median_ppi": 1.15,  # Perceived 15% higher than actual
        "sample_size": 1240,
        "computed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
]

def init_mock_db():
    if not challenge_items:
        for item in CATALOG:
            c_id = str(uuid.uuid4())
            challenge_items[c_id] = {
                "id": c_id,
                "product_id": item["id"],
                "actual_price": item["price"],
                "category": item["category"],
                "detail_tiers": [
                    {"reveal_at_seconds": 15, "label": "Category", "value": item["category"]},
                    {"reveal_at_seconds": 30, "label": "Gender", "value": item.get("gender", "Unisex")},
                    {"reveal_at_seconds": 45, "label": "Style", "value": ", ".join(item.get("aesthetic_tags", [])[:2])}
                ],
                "image_url": item.get("image_url"),
                "name": item.get("name")
            }

def get_user_ledger(user_id: str) -> Dict[str, Any]:
    if user_id not in user_reward_ledger:
        user_reward_ledger[user_id] = {
            "user_id": user_id,
            "points_balance": 0,
            "streak_count": 0,
            "last_played_date": None
        }
    return user_reward_ledger[user_id]

def update_streak(user_id: str):
    ledger = get_user_ledger(user_id)
    today = datetime.datetime.now(datetime.timezone.utc).date()
    
    if ledger["last_played_date"] == today:
        return # Already played today, streak unchanged
    
    if ledger["last_played_date"] == today - datetime.timedelta(days=1):
        ledger["streak_count"] = min(ledger["streak_count"] + 1, 5) # cap at 5
    else:
        ledger["streak_count"] = 1 # Reset or start new streak
        
    ledger["last_played_date"] = today

def expire_stale_cards(user_id: str):
    now = datetime.datetime.now(datetime.timezone.utc)
    for cid, card in deck_cards.items():
        if card["user_id"] == user_id and card["status"] == "shown":
            if card["shown_at"] is not None:
                elapsed = (now - card["shown_at"]).total_seconds()
                if elapsed > 65:  # 60s + 5s grace
                    card["status"] = "timed_out"

def generate_deck(user_id: str, date_str: str) -> str:
    deck_id = str(uuid.uuid4())
    daily_decks[deck_id] = {
        "id": deck_id,
        "user_id": user_id,
        "date": date_str,
        "generated_at": datetime.datetime.now(datetime.timezone.utc)
    }
    
    # Pick 5 random items for the demo
    items = list(challenge_items.values())
    random.shuffle(items)
    selected = items[:5]
    
    for i, item in enumerate(selected):
        card_id = str(uuid.uuid4())
        deck_cards[card_id] = {
            "id": card_id,
            "deck_id": deck_id,
            "user_id": user_id,
            "item_id": item["id"],
            "position": i,
            "status": "pending",
            "shown_at": None,
            "submitted_at": None,
            "guess_amount": None,
            "deviation_pct": None,
            "base_points": None,
            "speed_bonus_points": None,
            "total_points": None,
            "swipe_action": None,
            
            # Denormalized item details for frontend convenience
            "actual_price": item["actual_price"],
            "name": item["name"],
            "image_url": item["image_url"],
            "detail_tiers": item["detail_tiers"]
        }
    return deck_id

def get_today_deck(user_id: str) -> List[Dict[str, Any]]:
    init_mock_db()
    expire_stale_cards(user_id)
    
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    
    # Check if a deck exists for today
    deck_id = None
    for did, d in daily_decks.items():
        if d["user_id"] == user_id and d["date"] == today:
            deck_id = did
            break
            
    if not deck_id:
        deck_id = generate_deck(user_id, today)
        
    # Only return cards with status == 'pending'
    pending_cards = [
        card for card in deck_cards.values()
        if card["deck_id"] == deck_id and card["status"] == "pending"
    ]
    
    # Sort by position
    pending_cards.sort(key=lambda x: x["position"])
    return pending_cards

def mark_card_shown(card_id: str, user_id: str) -> Optional[datetime.datetime]:
    expire_stale_cards(user_id)
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")
        
    if card["status"] == "pending":
        card["status"] = "shown"
        card["shown_at"] = datetime.datetime.now(datetime.timezone.utc)
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

def submit_card(card_id: str, user_id: str, guess_amount: float) -> Dict[str, Any]:
    expire_stale_cards(user_id)
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")
        
    if card["status"] != "shown":
        raise ValueError("Card is not in a shown state")
        
    now = datetime.datetime.now(datetime.timezone.utc)
    elapsed = (now - card["shown_at"]).total_seconds()
    
    actual_price = card["actual_price"]
    deviation_pct = abs(guess_amount - actual_price) / actual_price
    
    base_points = tier_lookup(deviation_pct)
    speed_bonus = speed_bonus_curve(elapsed)
    
    ledger = get_user_ledger(user_id)
    streak_multiplier = 1.0 + (ledger.get("streak_count", 0) * 0.10)
    
    total_points = round(base_points * streak_multiplier) + speed_bonus
    
    # Update state
    update_streak(user_id)
    ledger["points_balance"] += total_points
    
    card["status"] = "submitted"
    card["submitted_at"] = now
    card["guess_amount"] = guess_amount
    card["deviation_pct"] = deviation_pct
    card["base_points"] = base_points
    card["speed_bonus_points"] = speed_bonus
    card["total_points"] = total_points
    
    return {
        "actual_price": actual_price,
        "guess_amount": guess_amount,
        "deviation_pct": deviation_pct,
        "base_points": base_points,
        "speed_bonus_points": speed_bonus,
        "total_points": total_points,
        "streak_count": ledger["streak_count"],
        "social_proof_line": f"Closer than {random.randint(60, 95)}% of users in your city"
    }

def swipe_card(card_id: str, user_id: str, action: str):
    card = deck_cards.get(card_id)
    if not card or card["user_id"] != user_id:
        raise ValueError("Card not found")
        
    if card["status"] in ["pending", "shown"] and card["guess_amount"] is None:
        card["status"] = "dismissed"
        
    card["swipe_action"] = action
