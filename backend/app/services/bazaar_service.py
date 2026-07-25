from typing import Dict, Any, Optional
from sqlmodel import Session

class BazaarService:
    @staticmethod
    def get_aggregated_bazaar_data(city: str, simulated_date: Optional[str] = None, session: Optional[Session] = None) -> Dict[str, Any]:
        from app.api.feed import fetch_feed
        from app.services.database import MockDB
        from app.repository.bazaar_repo import BazaarRepository
        
        # 1. Fetch active festivals for the city
        fest_data = fetch_feed(city=city, simulated_date=simulated_date, session=session)
        active_fest = fest_data.get("regional_festival") or ""
        
        # 2. Get theme configuration for the active festival
        theme = MockDB.get_bazaar_theme(active_fest)
        
        # 3. Get catalog (boutiques and products)
        catalog = BazaarRepository.get_local_bazaar_data(city)
        
        return {
            "state": catalog.get("state", ""),
            "active_festival": active_fest,
            "theme": theme,
            "boutiques": catalog.get("boutiques", []),
            "products": catalog.get("products", [])
        }

    @staticmethod
    def get_bargain_probability(original_price: int, proposed_price: int) -> Dict[str, Any]:
        """
        Calculates the probability of a boutique accepting a proposed bargain.
        Returns UI agnostic metadata.
        """
        if original_price <= 0:
            return {
                "label": "Invalid Price",
                "percentage": 0,
                "color_token": "red",
                "note": "Invalid original price."
            }
            
        ratio = proposed_price / original_price
        
        if ratio >= 0.92:
            return {
                "label": "High Probability",
                "percentage": 95,
                "color_token": "emerald",
                "note": "Boutique will likely accept instantly!"
            }
        elif ratio >= 0.82:
            return {
                "label": "Moderate / We Can Try",
                "percentage": 65,
                "color_token": "amber",
                "note": "Fair offer. Be prepared for a minor counter bid."
            }
        elif ratio >= 0.70:
            return {
                "label": "Low Probability",
                "percentage": 30,
                "color_token": "rose",
                "note": "Very low offer. Might get flatly rejected by artisan."
            }
        else:
            return {
                "label": "Unacceptable Bid",
                "percentage": 5,
                "color_token": "red",
                "note": "Boutique will reject this outright. Try a higher offer."
            }

    @staticmethod
    def calculate_negotiation(original_price: int, proposed_price: int) -> Dict[str, Any]:
        """
        Evaluates the proposed price and generates the official shop counter-offer string.
        Returns a dict suitable for BazaarNegotiationResponse.
        """
        if proposed_price >= original_price:
            return {
                "status": "accepted",
                "final_price": original_price,
                "message": "Thank you! The item is available at the standard listing price. Added to cart."
            }
            
        ratio = proposed_price / original_price
        
        # Negotiation Logic
        if ratio >= 0.92:
            # Accept proposed price
            return {
                "status": "accepted",
                "final_price": proposed_price,
                "message": f"Acceptable! The boutique has agreed to your price of ₹{proposed_price}. Limited festival stock reserved for you!"
            }
        elif ratio >= 0.82:
            # Counter-offer
            counter = int((original_price + proposed_price) / 2)
            # Ensure it's a clean round number
            counter = (counter // 10) * 10
            return {
                "status": "counter-offered",
                "final_price": counter,
                "message": f"Boutique response: 'Since you are shopping for the festival, we can do ₹{counter}. That is our absolute best price!'"
            }
        elif ratio >= 0.70:
            # Reject and suggest 85%
            counter = int(original_price * 0.85)
            counter = (counter // 10) * 10
            return {
                "status": "counter-offered",
                "final_price": counter,
                "message": f"Boutique response: '₹{proposed_price} is too low for pure handloom fabric. We can offer a festive discount down to ₹{counter}.'"
            }
        else:
            # Flat rejection
            counter = int(original_price * 0.90)
            counter = (counter // 10) * 10
            return {
                "status": "rejected",
                "final_price": counter,
                "message": f"Boutique response: 'Sorry, we cannot offer the item at ₹{proposed_price}. The lowest we can do for this premium work is ₹{counter}.'"
            }
