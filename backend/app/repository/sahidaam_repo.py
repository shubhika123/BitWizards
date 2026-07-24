import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.services.database import CATALOG

# In-memory stores (mock DB)
challenge_items: Dict[str, Any] = {}
daily_decks: Dict[str, Any] = {}
deck_cards: Dict[str, Any] = {}
user_reward_ledger: Dict[str, Any] = {}
user_interactions_log: List[Dict[str, Any]] = []
user_preferences: Dict[str, Dict[str, set]] = {}

ppi_aggregates: List[Dict[str, Any]] = [
    {
        "category": "Topwear",
        "region": "North",
        "age_band": "18-24",
        "gender": "Unisex",
        "median_ppi": 1.15,
        "sample_size": 1240,
        "computed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
]

class SahiDaamRepository:
    """
    Universal repository layer for SahiDaam Game.
    Encapsulates all in-memory data structures.
    """
    
    @staticmethod
    def get_challenge_items() -> Dict[str, Any]:
        return challenge_items
        
    @staticmethod
    def set_challenge_items(items: Dict[str, Any]):
        global challenge_items
        challenge_items.update(items)
        
    @staticmethod
    def get_daily_decks() -> Dict[str, Any]:
        return daily_decks
        
    @staticmethod
    def add_daily_deck(deck_id: str, deck_data: Dict[str, Any]):
        daily_decks[deck_id] = deck_data
        
    @staticmethod
    def get_deck_cards() -> Dict[str, Any]:
        return deck_cards
        
    @staticmethod
    def add_deck_card(card_id: str, card_data: Dict[str, Any]):
        deck_cards[card_id] = card_data
        
    @staticmethod
    def get_user_ledger(user_id: str) -> Dict[str, Any]:
        if user_id not in user_reward_ledger:
            user_reward_ledger[user_id] = {
                "user_id": user_id,
                "points_balance": 0,
                "streak_count": 0,
                "last_played_date": None
            }
        return user_reward_ledger[user_id]

    @staticmethod
    def get_user_preferences(user_id: str) -> Dict[str, set]:
        if user_id not in user_preferences:
            user_preferences[user_id] = {
                "wishlist": set(),
                "unrecommend": set()
            }
        return user_preferences[user_id]

    @staticmethod
    def log_interaction(log_entry: Dict[str, Any]):
        user_interactions_log.append(log_entry)

    @staticmethod
    def get_ppi_aggregates() -> List[Dict[str, Any]]:
        return ppi_aggregates

    @staticmethod
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
