from typing import Dict, Any, List
import datetime
from app.services import sahidaam_db

def get_dashboard_metrics() -> Dict[str, Any]:
    """
    Aggregates real data from user_interactions_log and deck_cards.
    """
    deck_cards = sahidaam_db.deck_cards
    daily_decks = sahidaam_db.daily_decks
    
    # 1. Engagement Metrics
    unique_players = set(card["user_id"] for card in deck_cards.values())
    total_players = len(unique_players)
    
    print(f"[Dashboard Log] Fetch request received. Total Unique Users Seen So Far: {total_players}")
    print(f"[Dashboard Log] Unique User IDs: {list(unique_players)}")
    
    completed_decks = 0
    total_decks = len(daily_decks)
    
    # Pre-calculate cards per deck
    cards_per_deck = {}
    for card in deck_cards.values():
        did = card["deck_id"]
        if did not in cards_per_deck:
            cards_per_deck[did] = []
        cards_per_deck[did].append(card)
        
    for did, cards in cards_per_deck.items():
        if len(cards) >= 5 and all(c["status"] == "submitted" for c in cards):
            completed_decks += 1
            
    completion_rate = round((completed_decks / total_decks * 100), 1) if total_decks > 0 else 0.0
    
    submitted_cards = [c for c in deck_cards.values() if c["status"] == "submitted"]
    avg_cards_played = round(len(submitted_cards) / total_players, 1) if total_players > 0 else 0.0
    
    # Avg Session Time: simple estimate based on submitted_at - shown_at
    total_session_seconds = 0
    valid_sessions = 0
    for cards in cards_per_deck.values():
        submitted = [c for c in cards if c["status"] == "submitted" and c.get("shown_at") and c.get("submitted_at")]
        if submitted:
            min_time = min(c["shown_at"] for c in submitted)
            max_time = max(c["submitted_at"] for c in submitted)
            total_session_seconds += (max_time - min_time).total_seconds()
            valid_sessions += 1
            
    avg_session_time = round((total_session_seconds / 60) / valid_sessions, 1) if valid_sessions > 0 else 0.0
    
    # Daily Participation Trend
    trend_dict = {}
    for deck in daily_decks.values():
        try:
            date_obj = datetime.date.fromisoformat(deck["date"])
            date_str = date_obj.strftime("%b %d")
        except ValueError:
            date_str = str(deck["date"])
            
        if date_str not in trend_dict:
            trend_dict[date_str] = set()
        trend_dict[date_str].add(deck["user_id"])
        
    trend = [{"date": k, "players": len(v)} for k, v in trend_dict.items()]
    
    engagement = {
        "total_players": total_players,
        "completion_rate": completion_rate,
        "avg_cards_played": avg_cards_played,
        "avg_session_time": avg_session_time,
        "daily_participation_trend": trend or [{"date": datetime.datetime.now().strftime("%b %d"), "players": 0}]
    }
    
    # 2. Price IQ Metrics
    avg_guess_error = 0.0
    if submitted_cards:
        # We calculate the actual (signed) error: (guess - actual) / actual
        signed_errors = [((c["guess_amount"] - c["actual_price"]) / c["actual_price"] * 100) for c in submitted_cards]
        avg_guess_error = round(sum(signed_errors) / len(signed_errors), 1)
        
    bins = {"< -20%": 0, "-20 to -10%": 0, "-10 to 0%": 0, "0 to 10%": 0, "10 to 20%": 0, "> 20%": 0}
    cat_error = {}
    
    item_stats = {}
    import math
    
    for c in submitted_cards:
        # Individual deviation for overall bins
        dev = ((c["guess_amount"] - c["actual_price"]) / c["actual_price"]) * 100
        
        if dev < -20: bins["< -20%"] += 1
        elif dev < -10: bins["-20 to -10%"] += 1
        elif dev < 0: bins["-10 to 0%"] += 1
        elif dev <= 10: bins["0 to 10%"] += 1
        elif dev <= 20: bins["10 to 20%"] += 1
        else: bins["> 20%"] += 1
        
        item = sahidaam_db.challenge_items.get(c["item_id"], {})
        cat = item.get("category", "Unknown")
        if cat not in cat_error:
            cat_error[cat] = []
        cat_error[cat].append(dev)
        
        # Collect for item grouping
        iid = c["item_id"]
        if iid not in item_stats:
            item_stats[iid] = {
                "name": c["name"],
                "image_url": c["image_url"],
                "actual_price": c["actual_price"],
                "guesses": []
            }
        item_stats[iid]["guesses"].append(c["guess_amount"])
        
    item_errors = []
    item_std_devs = []
    
    for iid, stats in item_stats.items():
        guesses = stats["guesses"]
        n = len(guesses)
        mean_guess = sum(guesses) / n
        actual = stats["actual_price"]
        mean_dev = ((mean_guess - actual) / actual) * 100
        
        if n > 1:
            variance = sum((g - mean_guess)**2 for g in guesses) / (n - 1)
            std_dev = math.sqrt(variance)
        else:
            std_dev = 0.0
            
        item_errors.append({
            "name": stats["name"],
            "image_url": stats["image_url"],
            "actual_price": actual,
            "guess_amount": round(mean_guess, 1),
            "error_pct": round(mean_dev, 1)
        })
        
        item_std_devs.append({
            "name": stats["name"],
            "std_dev": round(std_dev, 1),
            "mean_guess": round(mean_guess, 1)
        })
        
    guess_error_distribution = [{"bin": k, "count": v} for k, v in bins.items()]
    
    category_wise_error = []
    for cat, errs in cat_error.items():
        category_wise_error.append({
            "category": cat,
            "error": round(sum(errs) / len(errs), 1)
        })
        
    # Sort for Gain (Highest positive error)
    highest_perceived_gain = sorted(
        [i for i in item_errors if i["error_pct"] > 0], 
        key=lambda x: x["error_pct"], 
        reverse=True
    )[:5]
    
    # Sort for Loss (Highest negative error)
    highest_perceived_loss = sorted(
        [i for i in item_errors if i["error_pct"] < 0], 
        key=lambda x: x["error_pct"]
    )[:5]
    
    # Sort std devs
    item_std_devs = sorted(item_std_devs, key=lambda x: x["std_dev"], reverse=True)[:8]
        
    price_iq = {
        "avg_guess_error": avg_guess_error,
        "guess_error_distribution": guess_error_distribution,
        "category_wise_error": category_wise_error,
        "regional_price_iq": [{"region": "Unknown (Demo)", "error": avg_guess_error}],
        "highest_perceived_gain": highest_perceived_gain,
        "highest_perceived_loss": highest_perceived_loss,
        "item_std_devs": item_std_devs
    }
    
    # 3. Behavioral Insights (real data not available yet for these exact metrics)
    behavioral = {
        "brand_familiarity": [],
        "avg_slider_adjustments": 0,
        "avg_hesitation_time": 0,
        "confidence_score_avg": 0,
        "confidence_distribution": []
    }
    
    return {
        "engagement": engagement,
        "price_iq": price_iq,
        "behavioral": behavioral
    }
