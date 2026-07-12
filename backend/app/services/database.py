import random
from typing import List, Dict, Any, Optional

# Mock Catalog Database
PRODUCTS = [
    # North India / ethnic
    {
        "id": "prod_1",
        "name": "Handcrafted Chikankari Cotton Kurta",
        "category": "Ethnic Wear",
        "sub_category": "Kurta",
        "price": 1299,
        "region": "Lucknow",
        "festivals": ["Raksha Bandhan", "Teej", "Eid"],
        "weather": ["Summer", "Humid", "Monsoon"],
        "budget_bracket": "budget",
        "style": "Traditional Elegant",
        "description": "Premium hand-woven cotton Chikankari kurta in pastel shades. Breathable fabric perfect for warm weather and festive family gatherings.",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Avadh Weaves",
        "rating": 4.5,
        "reviews": [
            "Super comfortable for summer. The chikankari embroidery is genuine.",
            "Loved the material, size fits perfectly. Recommended for Teej!"
        ]
    },
    {
        "id": "prod_2",
        "name": "Jaipur Bandhani Printed Anarkali Suit Set",
        "category": "Ethnic Wear",
        "sub_category": "Suit Set",
        "price": 2499,
        "region": "Jaipur",
        "festivals": ["Teej", "Diwali", "Karwa Chauth"],
        "weather": ["Summer", "Dry"],
        "budget_bracket": "mid-range",
        "style": "Traditional Bright",
        "description": "Vibrant Jaipur Bandhani tie-dye Anarkali suit with beautiful gotta-patti borders. Comes with a matching chiffon dupatta.",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Rajputana Heritage Boutique",
        "rating": 4.7,
        "reviews": [
            "Wore it for Teej, got so many compliments! True Rajasthani vibe.",
            "Bright colors, didn't bleed after first wash. Great quality."
        ]
    },
    # South India / traditional
    {
        "id": "prod_3",
        "name": "Classic Kerala Kasavu Saree with Golden Zari",
        "category": "Ethnic Wear",
        "sub_category": "Saree",
        "price": 1850,
        "region": "Kerala",
        "festivals": ["Onam", "Vishu", "Weddings"],
        "weather": ["Humid", "Rainy", "Summer"],
        "budget_bracket": "budget",
        "style": "Traditional Minimalist",
        "description": "Authentic Kerala Kasavu handloom cotton saree with fine golden zari border. Lightweight, traditional off-white drape.",
        "image_url": "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Nair Handlooms",
        "rating": 4.8,
        "reviews": [
            "Exactly what I needed for Onam. Pure cotton, comfortable in humid weather.",
            "Beautiful gold border. Drapes perfectly."
        ]
    },
    {
        "id": "prod_4",
        "name": "Royal Kanjeevaram Silk Saree",
        "category": "Ethnic Wear",
        "sub_category": "Saree",
        "price": 4500,
        "region": "Coimbatore",
        "festivals": ["Diwali", "Pongal", "Weddings"],
        "weather": ["Cool", "Dry"],
        "budget_bracket": "premium",
        "style": "Grand Traditional",
        "description": "Luxurious Coimbatore-woven silk saree with intricate temple motifs and rich zari border. Perfect for brides and wedding guests.",
        "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Coimbatore Silk House",
        "rating": 4.9,
        "reviews": [
            "Pure silk mark certified. The shine and drape are outstanding.",
            "Absolutely beautiful for my sister's wedding in Chennai. Highly recommended."
        ]
    },
    # Modern / GenZ
    {
        "id": "prod_5",
        "name": "Oversized Streetwear Tee - Monsoon Drop",
        "category": "Western Wear",
        "sub_category": "T-Shirt",
        "price": 799,
        "region": "Delhi",
        "festivals": ["College Fest", "Daily Wear"],
        "weather": ["Monsoon", "Rainy", "Summer"],
        "budget_bracket": "budget",
        "style": "GenZ Streetwear",
        "description": "Heavyweight 240 GSM cotton oversized t-shirt with graffiti print back. Drop shoulder fit, ideal for college campuses.",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Dilli Rebels Co.",
        "rating": 4.3,
        "reviews": [
            "Super thick cotton, feels like an expensive streetwear brand.",
            "Great fit, prints don't fade. Awesome styling with cargos."
        ]
    },
    {
        "id": "prod_6",
        "name": "Utility Cargo Pants with Adjustable Straps",
        "category": "Western Wear",
        "sub_category": "Cargos",
        "price": 1499,
        "region": "Delhi",
        "festivals": ["College Fest", "Daily Wear"],
        "weather": ["Cool", "Dry", "Monsoon"],
        "budget_bracket": "budget",
        "style": "GenZ Streetwear",
        "description": "Multi-pocket cargo pants in durable cotton-twill fabric. Features drawstrings at cuffs and relaxed tactical fit.",
        "image_url": "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Dilli Rebels Co.",
        "rating": 4.4,
        "reviews": [
            "Lots of pockets! Durable fabric and looks very stylish.",
            "A bit long but the drawstring at the bottom solved it. Perfect streetwear."
        ]
    },
    # East India / traditional
    {
        "id": "prod_7",
        "name": "Traditional Lal Paar Cotton Saree",
        "category": "Ethnic Wear",
        "sub_category": "Saree",
        "price": 1150,
        "region": "Patna",
        "festivals": ["Durga Puja", "Chhath Puja", "Saraswati Puja"],
        "weather": ["Summer", "Humid"],
        "budget_bracket": "budget",
        "style": "Traditional Iconic",
        "description": "Authentic white cotton saree with a broad red border (Lal Paar). Classic Bengali / Bihari traditional drape for auspicious occasions.",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Pataliputra Weaves",
        "rating": 4.6,
        "reviews": [
            "Lightweight, perfect for Chhath Puja morning arghya.",
            "True to description, soft cotton fabric."
        ]
    },
    # Andhra/Telangana / Ethnic
    {
        "id": "prod_8",
        "name": "Banarasi Silk Sharara Suit Set",
        "category": "Ethnic Wear",
        "sub_category": "Sharara",
        "price": 3200,
        "region": "Vizag",
        "festivals": ["Eid", "Diwali", "Weddings"],
        "weather": ["Cool", "Dry"],
        "budget_bracket": "premium",
        "style": "Glamour Ethnic",
        "description": "Royal Banarasi brocade short kurti paired with a flared sharara pants and net dupatta. Rich weaving details.",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
        "local_boutique": "Vizag Ethnic Hub",
        "rating": 4.7,
        "reviews": [
            "Flared sharara is huge, looks like a lehenga. Brocade shines beautifully.",
            "Wore it to my friend's sangeet, everyone loved it."
        ]
    }
]

LOCAL_BOUTIQUES = [
    {
        "id": "boutique_1",
        "name": "Avadh Weaves",
        "city": "Lucknow",
        "rating": 4.8,
        "verified": True,
        "distance_km": 2.4,
        "speciality": "Handmade Chikankari",
        "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80"
    },
    {
        "id": "boutique_2",
        "name": "Rajputana Heritage Boutique",
        "city": "Jaipur",
        "rating": 4.9,
        "verified": True,
        "distance_km": 1.8,
        "speciality": "Bandhani & Gotta Patti",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    },
    {
        "id": "boutique_3",
        "name": "Nair Handlooms",
        "city": "Kochi",
        "rating": 4.7,
        "verified": True,
        "distance_km": 3.1,
        "speciality": "Traditional Kerala Handlooms",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
    },
    {
        "id": "boutique_4",
        "name": "Coimbatore Silk House",
        "city": "Coimbatore",
        "rating": 4.9,
        "verified": True,
        "distance_km": 1.2,
        "speciality": "Kanjeevaram & Cotton Silks",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
        "id": "boutique_5",
        "name": "Dilli Rebels Co.",
        "city": "Delhi",
        "rating": 4.5,
        "verified": True,
        "distance_km": 4.0,
        "speciality": "Monsoon Streetwear & Over-sized Apparel",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
        "id": "boutique_6",
        "name": "Pataliputra Weaves",
        "city": "Patna",
        "rating": 4.6,
        "verified": True,
        "distance_km": 2.9,
        "speciality": "Traditional Cotton & Tussar Sarees",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    }
]

# Outfit Circle Mock Groups
OUTFIT_GROUPS = [
    {
        "id": "group_1",
        "name": "Jaipur Wedding Prep",
        "members_count": 4,
        "creator": "Kuhu",
        "items": [
            {
                "id": "item_1",
                "product_id": "prod_2",
                "votes": 12,
                "voted_by": ["Kuhu", "Aditi", "Rohan"],
                "comments": [
                    {"user": "Aditi", "text": "This pink bandhani suits the theme perfectly!"},
                    {"user": "Rohan", "text": "Nice, matches the Jaipur vibe."}
                ]
            },
            {
                "id": "item_2",
                "product_id": "prod_8",
                "votes": 5,
                "voted_by": ["Kuhu", "Sneha"],
                "comments": [
                    {"user": "Sneha", "text": "Sharara is good but might be too heavy for noon events."}
                ]
            }
        ]
    },
    {
        "id": "group_2",
        "name": "College Fest Streetwear",
        "members_count": 5,
        "creator": "Rohan",
        "items": [
            {
                "id": "item_3",
                "product_id": "prod_5",
                "votes": 18,
                "voted_by": ["Rohan", "Aditya", "Vikram", "Neha"],
                "comments": [
                    {"user": "Aditya", "text": "Insta-cop. Oversized fit is fire."},
                    {"user": "Neha", "text": "Are you planning to wear cargos with this?"}
                ]
            }
        ]
    }
]

class MockDB:
    @staticmethod
    def get_products() -> List[Dict[str, Any]]:
        return PRODUCTS

    @staticmethod
    def get_product(product_id: str) -> Optional[Dict[str, Any]]:
        for p in PRODUCTS:
            if p["id"] == product_id:
                return p
        return None

    @staticmethod
    def get_boutiques(city: Optional[str] = None) -> List[Dict[str, Any]]:
        if city:
            return [b for b in LOCAL_BOUTIQUES if b["city"].lower() == city.lower()]
        return LOCAL_BOUTIQUES

    @staticmethod
    def get_outfit_groups() -> List[Dict[str, Any]]:
        return OUTFIT_GROUPS

    @staticmethod
    def get_outfit_group(group_id: str) -> Optional[Dict[str, Any]]:
        for g in OUTFIT_GROUPS:
            if g["id"] == group_id:
                return g
        return None

    @staticmethod
    def vote_item(group_id: str, item_id: str, user: str) -> Optional[Dict[str, Any]]:
        group = MockDB.get_outfit_group(group_id)
        if not group:
            return None
        for item in group["items"]:
            if item["id"] == item_id:
                if user in item["voted_by"]:
                    item["voted_by"].remove(user)
                    item["votes"] -= 1
                else:
                    item["voted_by"].append(user)
                    item["votes"] += 1
                return item
        return None

    @staticmethod
    def add_comment(group_id: str, item_id: str, user: str, text: str) -> Optional[Dict[str, Any]]:
        group = MockDB.get_outfit_group(group_id)
        if not group:
            return None
        for item in group["items"]:
            if item["id"] == item_id:
                comment = {"user": user, "text": text}
                item["comments"].append(comment)
                return item
        return None
