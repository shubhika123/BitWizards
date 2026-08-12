"""
Module 2 Data Repository — Target Production Schema
"""

from typing import List, Dict, Any, Optional
from threading import Lock
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, ConfigDict


class ProductEntity(BaseModel):
    id: str
    name: str
    category: str = Field(..., pattern="^(Topwear|Bottomwear|Footwear|Accessory)$")
    price: int = Field(..., ge=300, le=4000)
    occasions: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    aesthetic_tags: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    image_url: str = Field(...)
    gender: str = Field(default="Unisex")
    brand: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


CATALOG: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # TOPWEAR (16 Items)
    # -------------------------------------------------------------------------
    {
        "id": "top_001",
        "name": "oversized 'syntax error' graphic tee",
        "category": "Topwear",
        "price": 699,
        "occasions": ["casual", "college fest"],
        "colors": ["black", "neon green"],
        "aesthetic_tags": ["streetwear", "tech-core", "baggy", "dark"],
        "keywords": ["t-shirt", "tshirt", "tee", "graphic tee"],
        "gender": "Unisex",
        "brand": "Roadster",
        "image_url": "/catalog/top_001.png"
    },
    {
        "id": "top_002",
        "name": "drop-shoulder flannel overshirt",
        "category": "Topwear",
        "price": 1199,
        "occasions": ["casual", "party", "date"],
        "colors": ["white", "grey"],
        "aesthetic_tags": ["streetwear", "layering", "grunge", "winter"],
        "keywords": ["shirt", "flannel", "flannel shirt", "jacket"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_003",
        "name": "heavyweight boxy hoodie",
        "category": "Topwear",
        "price": 1499,
        "occasions": ["casual", "college fest"],
        "colors": ["olive", "dark green"],
        "aesthetic_tags": ["streetwear", "minimalist", "cozy", "winter"],
        "keywords": ["hoodie", "sweatshirt", "hood"],
        "gender": "Unisex",
        "brand": "HERE&NOW",
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_004",
        "name": "vintage washed denim jacket",
        "category": "Topwear",
        "price": 1899,
        "occasions": ["casual", "party"],
        "colors": ["blue", "faded blue"],
        "aesthetic_tags": ["vintage", "layering", "classic", "rugged"],
        "keywords": ["jacket", "denim jacket", "jean jacket"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0efa?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_005",
        "name": "lucknowi chikankari short kurta",
        "category": "Topwear",
        "price": 1250,
        "occasions": ["festive", "wedding", "Formal-Ethnic"],
        "colors": ["mint", "pastel green", "white"],
        "aesthetic_tags": ["ethnic", "elegant", "light", "fusion", "modern", "trendy"],
        "keywords": ["kurta", "chikankari", "chikan", "lucknowi", "chikan kari", "embroidered kurta"],
        "gender": "Men",
        "brand": "Anouk",
        "image_url": "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_006",
        "name": "asymmetric silk blend kurta",
        "category": "Topwear",
        "price": 1599,
        "occasions": ["festive", "wedding", "party"],
        "colors": ["mustard", "yellow", "gold"],
        "aesthetic_tags": ["ethnic", "modern", "vibrant", "haldi"],
        "keywords": ["kurta", "silk kurta"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1583391733959-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_007",
        "name": "textured bandhgala nehru jacket",
        "category": "Topwear",
        "price": 2100,
        "occasions": ["wedding", "Formal-Ethnic"],
        "colors": ["navy", "black"],
        "aesthetic_tags": ["ethnic", "royal", "structured", "layering"],
        "keywords": ["nehru jacket", "bandhgala", "jacket", "blazer", "waistcoat"],
        "gender": "Men",
        "brand": "Libas",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_008",
        "name": "ribbed halter crop top",
        "category": "Topwear",
        "price": 499,
        "occasions": ["casual", "college fest", "party"],
        "colors": ["black", "white"],
        "aesthetic_tags": ["minimalist", "y2k", "sleek", "summer"],
        "keywords": ["crop top", "halter top", "top"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_009",
        "name": "crochet boxy cardigan",
        "category": "Topwear",
        "price": 999,
        "occasions": ["casual", "date"],
        "colors": ["cream", "beige"],
        "aesthetic_tags": ["boho", "vintage", "textured", "cozy"],
        "keywords": ["cardigan", "sweater", "knitwear"],
        "gender": "Women",
        "brand": "HRX",
        "image_url": "https://images.unsplash.com/photo-1434389678369-e8412675d0f6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_010",
        "name": "oversized graphic anime tee",
        "category": "Topwear",
        "price": 699,
        "occasions": ["casual", "college fest"],
        "colors": ["white", "grey", "red"],
        "aesthetic_tags": ["streetwear", "baggy", "gen-z", "kawaii"],
        "keywords": ["t-shirt", "tshirt", "tee", "anime tee"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_011",
        "name": "faux leather corset top",
        "category": "Topwear",
        "price": 1199,
        "occasions": ["party", "date"],
        "colors": ["black", "maroon"],
        "aesthetic_tags": ["edgy", "glam", "statement", "night-out"],
        "keywords": ["corset", "corset top", "top"],
        "gender": "Women",
        "brand": "DressBerry",
        "image_url": "https://images.unsplash.com/photo-1550614000-4b95dd2475a3?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_012",
        "name": "mirror work peplum kurti",
        "category": "Topwear",
        "price": 1499,
        "occasions": ["festive", "wedding"],
        "colors": ["hot pink", "magenta", "silver"],
        "aesthetic_tags": ["ethnic", "glam", "vibrant", "heavy"],
        "keywords": ["kurti", "kurta", "mirror work", "top"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_013",
        "name": "bandhani print angrakha",
        "category": "Topwear",
        "price": 1299,
        "occasions": ["festive", "casual"],
        "colors": ["red", "orange"],
        "aesthetic_tags": ["ethnic", "traditional", "flowy", "bright"],
        "keywords": ["angrakha", "kurta", "kurti", "bandhani"],
        "gender": "Women",
        "brand": "Sangria",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_014",
        "name": "foil print strappy blouse",
        "category": "Topwear",
        "price": 899,
        "occasions": ["wedding", "party"],
        "colors": ["gold", "cream"],
        "aesthetic_tags": ["ethnic", "fusion", "glam", "sleek"],
        "keywords": ["blouse", "top"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1574041705602-5ea912eb929d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_015",
        "name": "cotton anarkali kurta",
        "category": "Topwear",
        "price": 1100,
        "occasions": ["festive", "Office"],
        "colors": ["yellow", "mustard"],
        "aesthetic_tags": ["ethnic", "elegant", "haldi", "flowy"],
        "keywords": ["anarkali", "kurta", "kurti", "gown"],
        "gender": "Women",
        "brand": "Mast & Harbour",
        "image_url": "https://images.unsplash.com/photo-1617260537877-cd5f4ccda364?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_016",
        "name": "solid satin shirt",
        "category": "Topwear",
        "price": 999,
        "occasions": ["Formal-Business", "Office", "party", "date"],
        "colors": ["emerald green", "navy"],
        "aesthetic_tags": ["sleek", "elegant", "minimalist", "premium"],
        "keywords": ["shirt", "blouse", "satin shirt"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_017",
        "name": "zari-border silk rakhi kurta set",
        "category": "Topwear",
        "price": 1899,
        "occasions": ["raksha bandhan", "festive", "wedding"],
        "colors": ["maroon", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "celebratory", "heavy", "rakhi-special"],
        "keywords": ["kurta", "kurta set", "rakhi kurta", "silk kurta", "zari"],
        "gender": "Men",
        "brand": "Libas",
        "image_url": "https://images.unsplash.com/photo-1583391733959-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_018",
        "name": "embroidered bandhgala rakhi kurta",
        "category": "Topwear",
        "price": 2200,
        "occasions": ["raksha bandhan", "festive", "Formal-Ethnic"],
        "colors": ["navy", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "structured", "celebratory", "rakhi-special"],
        "keywords": ["kurta", "bandhgala", "rakhi kurta", "embroidered kurta"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_019",
        "name": "mirror work rakhi anarkali kurti",
        "category": "Topwear",
        "price": 1799,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["pink", "magenta"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "celebratory", "rakhi-special"],
        "keywords": ["kurti", "anarkali", "rakhi kurti", "mirror work"],
        "gender": "Women",
        "brand": "DressBerry",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_020",
        "name": "banarasi silk rakhi co-ord kurti set",
        "category": "Topwear",
        "price": 2100,
        "occasions": ["raksha bandhan", "festive", "wedding"],
        "colors": ["red", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "traditional", "heavy", "rakhi-special"],
        "keywords": ["kurti", "kurti set", "banarasi", "rakhi kurti", "co-ord set"],
        "gender": "Women",
        "brand": "Sangria",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_021",
        "name": "tricolor stripe block tee",
        "category": "Topwear",
        "price": 599,
        "occasions": ["independence day", "casual", "college fest"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "streetwear", "casual"],
        "keywords": ["t-shirt", "tshirt", "tee", "tricolor tee", "tiranga tee"],
        "gender": "Unisex",
        "brand": "Roadster",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_022",
        "name": "saffron-white-green angrakha kurta",
        "category": "Topwear",
        "price": 1499,
        "occasions": ["independence day", "festive"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["ethnic", "patriotic", "tricolor", "traditional"],
        "keywords": ["kurta", "angrakha", "tiranga kurta"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1583391733959-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_023",
        "name": "tiranga print anarkali kurti",
        "category": "Topwear",
        "price": 1599,
        "occasions": ["independence day", "festive"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["ethnic", "patriotic", "tricolor", "flowy"],
        "keywords": ["kurti", "anarkali", "tiranga kurti"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1617260537877-cd5f4ccda364?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_024",
        "name": "tricolor bandhgala nehru jacket",
        "category": "Topwear",
        "price": 2300,
        "occasions": ["independence day", "Formal-Ethnic"],
        "colors": ["white", "saffron"],
        "aesthetic_tags": ["ethnic", "patriotic", "structured", "layering"],
        "keywords": ["nehru jacket", "bandhgala", "jacket", "waistcoat"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_025",
        "name": "diya motif embroidered kurta",
        "category": "Topwear",
        "price": 1699,
        "occasions": ["diwali", "festive", "wedding"],
        "colors": ["maroon", "gold"],
        "aesthetic_tags": ["ethnic", "festive", "celebratory", "diwali-special"],
        "keywords": ["kurta", "diwali kurta", "embroidered kurta", "diya kurta"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1583391733959-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_026",
        "name": "sequinned diwali party kurti",
        "category": "Topwear",
        "price": 1899,
        "occasions": ["diwali", "festive", "party"],
        "colors": ["black", "gold"],
        "aesthetic_tags": ["ethnic", "glam", "party", "diwali-special"],
        "keywords": ["kurti", "sequin kurti", "party kurti", "diwali kurti"],
        "gender": "Women",
        "brand": "DressBerry",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_027",
        "name": "silk brocade diwali sherwani-style kurta",
        "category": "Topwear",
        "price": 2400,
        "occasions": ["diwali", "festive", "wedding"],
        "colors": ["maroon", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "heavy", "diwali-special"],
        "keywords": ["kurta", "sherwani", "diwali kurta", "brocade"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_028",
        "name": "diwali special banarasi kurti",
        "category": "Topwear",
        "price": 1999,
        "occasions": ["diwali", "festive"],
        "colors": ["red", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "traditional", "diwali-special"],
        "keywords": ["kurti", "banarasi", "diwali kurti"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # BOTTOMWEAR (14 Items)
    # -------------------------------------------------------------------------
    {
        "id": "bot_001",
        "name": "tech-wear multi-pocket cargos",
        "category": "Bottomwear",
        "price": 1499,
        "occasions": ["casual", "college fest"],
        "colors": ["black", "charcoal"],
        "aesthetic_tags": ["streetwear", "tech-core", "utility", "baggy"],
        "keywords": ["cargo pants", "cargos", "pants", "trousers"],
        "gender": "Men",
        "brand": "Roadster",
        "image_url": "/catalog/bot_001.png"
    },
    {
        "id": "bot_002",
        "name": "baggy nylon parachute pants",
        "category": "Bottomwear",
        "price": 1299,
        "occasions": ["casual", "party"],
        "colors": ["black"],
        "aesthetic_tags": ["streetwear", "y2k", "relaxed"],
        "keywords": ["parachute pants", "pants", "trousers"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1549037173-e3b710c541d6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_003",
        "name": "washed wide-leg denim",
        "category": "Bottomwear",
        "price": 1699,
        "occasions": ["casual", "date"],
        "colors": ["blue", "light blue"],
        "aesthetic_tags": ["streetwear", "vintage", "baggy", "casual"],
        "keywords": ["jeans", "denim", "denim pants", "wide-leg jeans"],
        "gender": "Unisex",
        "brand": "HERE&NOW",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_004",
        "name": "premium slim fit chinos",
        "category": "Bottomwear",
        "price": 1199,
        "occasions": ["Formal-Business", "Office", "date"],
        "colors": ["beigh", "cream"],
        "aesthetic_tags": ["minimalist", "smart-casual", "sleek", "tailored"],
        "keywords": ["chinos", "pants", "trousers"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_005",
        "name": "cotton blend aligarh pyjama",
        "category": "Bottomwear",
        "price": 699,
        "occasions": ["festive", "wedding"],
        "colors": ["white", "cream", "off-white"],
        "aesthetic_tags": ["ethnic", "traditional", "comfort", "light"],
        "keywords": ["pyjama", "pajama", "kurta pyjama", "churidar", "aligarh pyjama"],
        "gender": "Men",
        "brand": "Anouk",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_006",
        "name": "pleated silk dhoti pants",
        "category": "Bottomwear",
        "price": 1200,
        "occasions": ["wedding", "festive"],
        "colors": ["gold", "beige"],
        "aesthetic_tags": ["ethnic", "royal", "flowy", "traditional"],
        "keywords": ["dhoti", "dhoti pants"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1596489370005-cb6d860d5dd7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_007",
        "name": "high-waist flared cargo pants",
        "category": "Bottomwear",
        "price": 1399,
        "occasions": ["casual", "college fest", "party"],
        "colors": ["olive", "khaki", "brown"],
        "aesthetic_tags": ["streetwear", "y2k", "utility"],
        "keywords": ["cargo pants", "cargos", "pants"],
        "gender": "Women",
        "brand": "Libas",
        "image_url": "/catalog/bot_007.png"
    },
    {
        "id": "bot_008",
        "name": "distressed mom jeans",
        "category": "Bottomwear",
        "price": 1499,
        "occasions": ["casual", "date"],
        "colors": ["grey", "washed black"],
        "aesthetic_tags": ["vintage", "grunge", "relaxed", "casual"],
        "keywords": ["jeans", "mom jeans", "denim"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_009",
        "name": "pleated tennis skirt",
        "category": "Bottomwear",
        "price": 799,
        "occasions": ["casual", "party"],
        "colors": ["white", "plaid", "black"],
        "aesthetic_tags": ["y2k", "preppy", "summer", "kawaii"],
        "keywords": ["skirt", "tennis skirt", "mini skirt"],
        "gender": "Women",
        "brand": "HRX",
        "image_url": "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_010",
        "name": "flared crepe trousers",
        "category": "Bottomwear",
        "price": 1099,
        "occasions": ["Formal-Business", "Office", "party"],
        "colors": ["grey"],
        "aesthetic_tags": ["sleek", "elegant", "minimalist", "tailored"],
        "keywords": ["trousers", "pants"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1509631179647-0c708bd226ee?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_011",
        "name": "gotta patti sharara pants",
        "category": "Bottomwear",
        "price": 1799,
        "occasions": ["wedding", "festive"],
        "colors": ["pink", "magenta", "gold"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "flowy"],
        "keywords": ["sharara", "sharara pants", "gotta patti", "pants"],
        "gender": "Women",
        "brand": "DressBerry",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_012",
        "name": "printed cotton flared palazzo",
        "category": "Bottomwear",
        "price": 899,
        "occasions": ["festive", "casual"],
        "colors": ["yellow", "white", "mustard"],
        "aesthetic_tags": ["ethnic", "comfort", "vibrant", "boho"],
        "keywords": ["palazzo", "palazzo pants", "pants"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_013",
        "name": "brocade silk straight pants",
        "category": "Bottomwear",
        "price": 1299,
        "occasions": ["wedding", "festive", "party"],
        "colors": ["gold", "white"],
        "aesthetic_tags": ["ethnic", "fusion", "sleek", "premium"],
        "keywords": ["pants", "trousers"],
        "gender": "Women",
        "brand": "Sangria",
        "image_url": "https://images.unsplash.com/photo-1574041705602-5ea912eb929d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_014",
        "name": "block print cotton rakhi churidar",
        "category": "Bottomwear",
        "price": 899,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["cream", "yellow"],
        "aesthetic_tags": ["ethnic", "traditional", "comfort", "rakhi-special"],
        "keywords": ["churidar", "leggings", "pants", "rakhi churidar"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_015",
        "name": "white cotton straight pants",
        "category": "Bottomwear",
        "price": 999,
        "occasions": ["independence day", "casual", "Office"],
        "colors": ["white", "off-white"],
        "aesthetic_tags": ["minimalist", "patriotic-friendly", "versatile"],
        "keywords": ["pants", "trousers", "white pants"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_016",
        "name": "cotton silk rakhi pyjama",
        "category": "Bottomwear",
        "price": 799,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["white", "cream"],
        "aesthetic_tags": ["ethnic", "traditional", "comfort", "rakhi-special"],
        "keywords": ["pyjama", "kurta pyjama", "pants", "rakhi pyjama"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_017",
        "name": "gota patti rakhi palazzo",
        "category": "Bottomwear",
        "price": 999,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["yellow", "gold"],
        "aesthetic_tags": ["ethnic", "comfort", "vibrant", "rakhi-special"],
        "keywords": ["palazzo", "palazzo pants", "pants", "rakhi palazzo"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_018",
        "name": "raw silk straight pants for rakhi",
        "category": "Bottomwear",
        "price": 1199,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["gold", "maroon"],
        "aesthetic_tags": ["ethnic", "sleek", "premium", "rakhi-special"],
        "keywords": ["pants", "trousers", "silk pants"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1574041705602-5ea912eb929d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_019",
        "name": "tricolor track pants",
        "category": "Bottomwear",
        "price": 999,
        "occasions": ["independence day", "casual", "college fest"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "streetwear", "casual"],
        "keywords": ["track pants", "joggers", "pants"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1549037173-e3b710c541d6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_020",
        "name": "white silk churidar for tricolor kurta",
        "category": "Bottomwear",
        "price": 899,
        "occasions": ["independence day", "festive"],
        "colors": ["white"],
        "aesthetic_tags": ["ethnic", "patriotic-friendly", "traditional"],
        "keywords": ["churidar", "pyjama", "pants"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_021",
        "name": "tricolor palazzo pants",
        "category": "Bottomwear",
        "price": 899,
        "occasions": ["independence day", "festive", "casual"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["ethnic", "patriotic", "tricolor", "comfort"],
        "keywords": ["palazzo", "palazzo pants", "pants"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_022",
        "name": "silk churidar diwali pyjama",
        "category": "Bottomwear",
        "price": 799,
        "occasions": ["diwali", "festive"],
        "colors": ["gold", "cream"],
        "aesthetic_tags": ["ethnic", "traditional", "diwali-special"],
        "keywords": ["churidar", "pyjama", "pants"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_023",
        "name": "diwali brocade palazzo",
        "category": "Bottomwear",
        "price": 999,
        "occasions": ["diwali", "festive"],
        "colors": ["gold", "maroon"],
        "aesthetic_tags": ["ethnic", "vibrant", "diwali-special"],
        "keywords": ["palazzo", "palazzo pants", "pants"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_024",
        "name": "diwali dhoti pants",
        "category": "Bottomwear",
        "price": 1099,
        "occasions": ["diwali", "festive", "wedding"],
        "colors": ["gold", "beige"],
        "aesthetic_tags": ["ethnic", "royal", "traditional", "diwali-special"],
        "keywords": ["dhoti", "dhoti pants"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1596489370005-cb6d860d5dd7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_025",
        "name": "diwali sequin skirt",
        "category": "Bottomwear",
        "price": 1199,
        "occasions": ["diwali", "party", "festive"],
        "colors": ["black", "gold"],
        "aesthetic_tags": ["glam", "fusion", "diwali-special"],
        "keywords": ["skirt", "sequin skirt"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # FOOTWEAR (12 Items)
    # -------------------------------------------------------------------------
    {
        "id": "foot_001",
        "name": "chunky cyber sneakers",
        "category": "Footwear",
        "price": 1899,
        "occasions": ["casual", "college fest"],
        "colors": ["black", "neon green", "grey"],
        "aesthetic_tags": ["streetwear", "tech-core", "chunky", "statement"],
        "keywords": ["sneakers", "shoes"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_002",
        "name": "classic white platform sneakers",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["casual", "date", "party"],
        "colors": ["white", "off-white"],
        "aesthetic_tags": ["minimalist", "clean", "versatile", "streetwear"],
        "keywords": ["sneakers", "shoes"],
        "gender": "Unisex",
        "brand": "Mast & Harbour",
        "image_url": "/catalog/foot_002.png"
    },
    {
        "id": "foot_003",
        "name": "suede chelsea boots",
        "category": "Footwear",
        "price": 2100,
        "occasions": ["Formal-Business", "party", "date"],
        "colors": ["brown", "tan", "black"],
        "aesthetic_tags": ["smart-casual", "sleek", "classic", "winter"],
        "keywords": ["boots", "chelsea boots", "shoes"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_004",
        "name": "handcrafted kolhapuri sandals",
        "category": "Footwear",
        "price": 899,
        "occasions": ["festive", "wedding", "casual"],
        "colors": ["tan", "brown"],
        "aesthetic_tags": ["ethnic", "traditional", "rugged", "comfort"],
        "keywords": ["kolhapuri", "kolhapuri chappal", "sandals", "chappal", "chappals"],
        "gender": "Men",
        "brand": "Roadster",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_005",
        "name": "velvet embroidered mojris",
        "category": "Footwear",
        "price": 1450,
        "occasions": ["wedding", "festive"],
        "colors": ["navy", "black", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "heavy", "statement"],
        "keywords": ["mojri", "mojari", "jutti", "juttis", "shoes"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_006",
        "name": "pastel colorblock sneakers",
        "category": "Footwear",
        "price": 1499,
        "occasions": ["casual", "college fest"],
        "colors": ["pink", "mint", "white"],
        "aesthetic_tags": ["streetwear", "kawaii", "vibrant", "y2k"],
        "keywords": ["sneakers", "shoes"],
        "gender": "Women",
        "brand": "HERE&NOW",
        "image_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_007",
        "name": "strappy stiletto heels",
        "category": "Footwear",
        "price": 1699,
        "occasions": ["party", "date", "wedding"],
        "colors": ["black", "silver", "red"],
        "aesthetic_tags": ["glam", "sleek", "night-out", "elegant"],
        "keywords": ["heels", "stilettos", "shoes"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_008",
        "name": "woven faux leather mules",
        "category": "Footwear",
        "price": 999,
        "occasions": ["casual", "Office", "date"],
        "colors": ["beige", "tan", "cream"],
        "aesthetic_tags": ["minimalist", "smart-casual", "boho", "comfort"],
        "keywords": ["mules", "shoes"],
        "gender": "Women",
        "brand": "Anouk",
        "image_url": "https://images.unsplash.com/photo-1535043934128-d8f99333a921?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_009",
        "name": "embellished wedge sandals",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["wedding", "festive"],
        "colors": ["gold", "rose gold"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "traditional"],
        "keywords": ["wedges", "sandals", "heels"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_010",
        "name": "beaded flat juttis",
        "category": "Footwear",
        "price": 799,
        "occasions": ["festive", "casual"],
        "colors": ["yellow", "mustard", "multicolor"],
        "aesthetic_tags": ["ethnic", "vibrant", "handcrafted", "haldi"],
        "keywords": ["jutti", "juttis", "flats", "shoes"],
        "gender": "Women",
        "brand": "Libas",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_011",
        "name": "tricolor canvas sneakers",
        "category": "Footwear",
        "price": 1399,
        "occasions": ["independence day", "casual"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "streetwear", "casual"],
        "keywords": ["sneakers", "shoes", "canvas shoes"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_012",
        "name": "embellished diwali mojris",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["diwali", "festive", "wedding"],
        "colors": ["gold", "maroon"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "diwali-special"],
        "keywords": ["mojri", "jutti", "juttis", "shoes"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_013",
        "name": "traditional rakhi day mojris",
        "category": "Footwear",
        "price": 1199,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["maroon", "gold"],
        "aesthetic_tags": ["ethnic", "traditional", "rakhi-special"],
        "keywords": ["mojri", "mojari", "jutti", "shoes"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_014",
        "name": "kolhapuri flats for rakhi day",
        "category": "Footwear",
        "price": 799,
        "occasions": ["raksha bandhan", "festive"],
        "colors": ["tan", "gold"],
        "aesthetic_tags": ["ethnic", "traditional", "comfort", "rakhi-special"],
        "keywords": ["kolhapuri", "flats", "sandals", "chappal"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_015",
        "name": "white canvas shoes",
        "category": "Footwear",
        "price": 999,
        "occasions": ["independence day", "casual", "Office"],
        "colors": ["white"],
        "aesthetic_tags": ["minimalist", "patriotic-friendly", "versatile"],
        "keywords": ["sneakers", "shoes", "canvas shoes"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_016",
        "name": "tricolor flip flops",
        "category": "Footwear",
        "price": 499,
        "occasions": ["independence day", "casual"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "casual", "comfort"],
        "keywords": ["flip flops", "slippers", "sandals"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_017",
        "name": "tiranga block heels",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["independence day", "festive"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "elegant"],
        "keywords": ["heels", "block heels", "shoes"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_018",
        "name": "diwali special juttis",
        "category": "Footwear",
        "price": 999,
        "occasions": ["diwali", "festive"],
        "colors": ["gold", "red"],
        "aesthetic_tags": ["ethnic", "traditional", "diwali-special"],
        "keywords": ["jutti", "juttis", "shoes"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_019",
        "name": "diwali embellished heels",
        "category": "Footwear",
        "price": 1499,
        "occasions": ["diwali", "party", "festive"],
        "colors": ["gold", "black"],
        "aesthetic_tags": ["glam", "heavy", "diwali-special"],
        "keywords": ["heels", "shoes"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_020",
        "name": "diwali festive kolhapuris",
        "category": "Footwear",
        "price": 899,
        "occasions": ["diwali", "festive", "casual"],
        "colors": ["tan", "gold"],
        "aesthetic_tags": ["ethnic", "traditional", "diwali-special"],
        "keywords": ["kolhapuri", "sandals", "chappal"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # ACCESSORIES (12 Items)
    # -------------------------------------------------------------------------
    {
        "id": "acc_001",
        "name": "matte black metal chain pendant",
        "category": "Accessory",
        "price": 349,
        "occasions": ["casual", "college fest", "party"],
        "colors": ["black", "dark grey"],
        "aesthetic_tags": ["streetwear", "edgy", "minimalist", "tech-core"],
        "keywords": ["pendant", "necklace", "chain"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_002",
        "name": "nylon tech crossbody bag",
        "category": "Accessory",
        "price": 699,
        "occasions": ["casual", "college fest"],
        "colors": ["olive", "black", "neon"],
        "aesthetic_tags": ["streetwear", "utility", "baggy", "functional"],
        "keywords": ["bag", "sling bag", "crossbody bag"],
        "gender": "Unisex",
        "brand": "HRX",
        "image_url": "/catalog/acc_002.png"
    },
    {
        "id": "acc_003",
        "name": "digital retro chronograph watch",
        "category": "Accessory",
        "price": 899,
        "occasions": ["casual", "Office", "date"],
        "colors": ["silver", "black"],
        "aesthetic_tags": ["minimalist", "vintage", "classic", "geek"],
        "keywords": ["watch", "wristwatch"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_004",
        "name": "tinted aviator sunglasses",
        "category": "Accessory",
        "price": 599,
        "occasions": ["casual", "party"],
        "colors": ["gold", "green", "brown"],
        "aesthetic_tags": ["classic", "vintage", "statement"],
        "keywords": ["sunglasses", "shades", "glasses"],
        "gender": "Unisex",
        "brand": "DressBerry",
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_005",
        "name": "silk pocket square & brooch set",
        "category": "Accessory",
        "price": 450,
        "occasions": ["wedding", "Formal-Ethnic"],
        "colors": ["maroon", "gold", "navy"],
        "aesthetic_tags": ["ethnic", "royal", "sleek", "premium"],
        "keywords": ["pocket square", "brooch"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1613588718956-c2e8f29ea156?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_006",
        "name": "oxidised silver jhumkas",
        "category": "Accessory",
        "price": 399,
        "occasions": ["festive", "wedding", "college fest"],
        "colors": ["silver", "oxidised"],
        "aesthetic_tags": ["ethnic", "boho", "heavy", "traditional"],
        "keywords": ["jhumka", "jhumkas", "earrings"],
        "gender": "Women",
        "brand": "Sangria",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_007",
        "name": "kundan & pearl choker set",
        "category": "Accessory",
        "price": 1299,
        "occasions": ["wedding", "festive"],
        "colors": ["gold", "white", "pink"],
        "aesthetic_tags": ["ethnic", "royal", "glam", "heavy"],
        "keywords": ["choker", "necklace", "jewellery", "jewelry", "kundan"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1599643478524-fb524b0b14c1?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_008",
        "name": "embroidered silk potli bag",
        "category": "Accessory",
        "price": 599,
        "occasions": ["wedding", "festive"],
        "colors": ["magenta", "gold", "yellow"],
        "aesthetic_tags": ["ethnic", "traditional", "vibrant", "haldi"],
        "keywords": ["potli", "potli bag", "clutch", "bag"],
        "gender": "Women",
        "brand": "Mast & Harbour",
        "image_url": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_009",
        "name": "y2k mini shoulder bag",
        "category": "Accessory",
        "price": 799,
        "occasions": ["casual", "party", "date"],
        "colors": ["black", "silver"],
        "aesthetic_tags": ["y2k", "streetwear", "minimalist", "trendy"],
        "keywords": ["bag", "shoulder bag"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_010",
        "name": "layered gold chain necklace",
        "category": "Accessory",
        "price": 499,
        "occasions": ["casual", "party", "Office"],
        "colors": ["gold"],
        "aesthetic_tags": ["minimalist", "sleek", "elegant", "everyday"],
        "keywords": ["necklace", "chain"],
        "gender": "Women",
        "brand": "Roadster",
        "image_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_011",
        "name": "floral hair gajra accessory",
        "category": "Accessory",
        "price": 350,
        "occasions": ["wedding", "festive"],
        "colors": ["white", "yellow", "orange"],
        "aesthetic_tags": ["ethnic", "traditional", "vibrant", "floral"],
        "keywords": ["gajra", "hair accessory", "hair clip"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1588616140502-3c1a84f3eb3c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_012",
        "name": "handcrafted designer rakhi thread duo",
        "category": "Accessory",
        "price": 349,
        "occasions": ["raksha bandhan"],
        "colors": ["red", "gold", "multicolor"],
        "aesthetic_tags": ["ethnic", "traditional", "sentimental", "rakhi-special", "gift"],
        "keywords": ["rakhi", "rakhi thread", "rakhi set", "bracelet"],
        "gender": "Unisex",
        "image_url": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRlLb0y1kxqA0agpwI3n-ql6KrdGA4Is6-9gfgsTfeumwYUYe-uXK_PB0u7I8ZO4tg906Ne_KpFGjCxCiQkJvQTRQ_hYWcpneIKvVS7oTI"
    },
    {
        "id": "acc_013",
        "name": "sibling matching rakhi gift potli duo",
        "category": "Accessory",
        "price": 599,
        "occasions": ["raksha bandhan"],
        "colors": ["magenta", "gold"],
        "aesthetic_tags": ["ethnic", "traditional", "gift", "rakhi-special"],
        "keywords": ["potli", "gift bag", "rakhi gift", "hamper"],
        "gender": "Unisex",
        "image_url": "https://nestasia.in/cdn/shop/files/cover_52.jpg?v=1783321722&width=600"
    },
    {
        "id": "acc_014",
        "name": "tricolor enamel badge pin",
        "category": "Accessory",
        "price": 320,
        "occasions": ["independence day"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "statement"],
        "keywords": ["badge", "pin", "brooch", "tiranga pin"],
        "gender": "Unisex",
        "image_url": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTqsocLnmNPbnom9XO3z-u1GHs0rHESTb0YzEbnXsuSaiIq6s4b5NSFFMvj0Tv3xDJNetaWW5eeU6-Cd2vfRuBwB6DA74dNbqLcHau7LSQ"
    },
    {
        "id": "acc_015",
        "name": "tiranga silk stole",
        "category": "Accessory",
        "price": 449,
        "occasions": ["independence day", "festive"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "elegant"],
        "keywords": ["stole", "dupatta", "scarf", "tiranga stole"],
        "gender": "Unisex",
        "image_url": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTKl2fnqH3_Gypf8A-kmtEUwgIrGlferkd8qaMtR0r70k5L9D1NrPaRA04TKI_gWBCMQR1zbC3yG1rUSCTsm4ve8Y-YQrJuwg"
    },
    {
        "id": "acc_016",
        "name": "traditional diya-shaped jhumka earrings",
        "category": "Accessory",
        "price": 499,
        "occasions": ["diwali", "festive"],
        "colors": ["gold", "oxidised"],
        "aesthetic_tags": ["ethnic", "traditional", "diwali-special"],
        "keywords": ["earrings", "jhumka", "diya earrings", "jewellery"],
        "gender": "Women",
        "image_url": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT4y4CQPUbng0LeXdzUZ1CmfCGeznz62I7uQQ8veftB-Bg2BMl259XIi6g6SSAShCMtGMmQ8U9Jq79Jt_2gMmlUgKg3pKFr"
    },
    {
        "id": "acc_017",
        "name": "rakhi day kalava & tilak set",
        "category": "Accessory",
        "price": 320,
        "occasions": ["raksha bandhan"],
        "colors": ["red", "gold"],
        "aesthetic_tags": ["ethnic", "traditional", "ritual", "rakhi-special"],
        "keywords": ["kalava", "tilak", "rakhi set", "puja thali"],
        "gender": "Unisex",
        "image_url": "https://m.media-amazon.com/images/I/51nIBYAzzzL._AC_UF894,1000_QL80_.jpg"
    },
    {
        "id": "acc_018",
        "name": "matching sibling friendship bangles duo",
        "category": "Accessory",
        "price": 449,
        "occasions": ["raksha bandhan"],
        "colors": ["gold", "silver"],
        "aesthetic_tags": ["ethnic", "sentimental", "rakhi-special"],
        "keywords": ["bangles", "bracelet", "sibling set"],
        "gender": "Unisex",
        "image_url": "https://m.media-amazon.com/images/I/817p4UG6BZL._AC_UY1100_.jpg"
    },
    {
        "id": "acc_019",
        "name": "tricolor flag wristband",
        "category": "Accessory",
        "price": 320,
        "occasions": ["independence day"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "casual"],
        "keywords": ["wristband", "bracelet", "tiranga band"],
        "gender": "Unisex",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGpY4nPEZhQcjzczI7h_O1ED0Lz0XNw-KjEjcKCjBxIA&s"
    },
    {
        "id": "acc_020",
        "name": "tiranga tote bag",
        "category": "Accessory",
        "price": 599,
        "occasions": ["independence day", "casual"],
        "colors": ["saffron", "white", "green"],
        "aesthetic_tags": ["patriotic", "tricolor", "functional"],
        "keywords": ["tote", "tote bag", "bag"],
        "gender": "Unisex",
        "image_url": "https://www.nicobar.com/cdn/shop/products/1533806742IMG_2099_5d1150e5-15d6-4048-a48b-9aefc3841cbe.jpg?v=1610452489&width=1200"
    },
    {
        "id": "acc_021",
        "name": "kundan maang tikka diwali set",
        "category": "Accessory",
        "price": 699,
        "occasions": ["diwali", "festive", "wedding"],
        "colors": ["gold", "white"],
        "aesthetic_tags": ["ethnic", "royal", "diwali-special"],
        "keywords": ["maang tikka", "kundan", "jewellery"],
        "gender": "Women",
        "image_url": "https://ik.imagekit.io/4sjmoqtje/tr:c-at_max/cdn/shop/files/green-kundan-necklace-maangtikka-and-earrings-set-sg370901-1_f7cbb1ec-2a25-402e-91e0-d95548ce3f72.jpg?v=1764157563&w=1000"
    },
    {
        "id": "acc_022",
        "name": "diwali festive potli bag",
        "category": "Accessory",
        "price": 549,
        "occasions": ["diwali", "festive"],
        "colors": ["gold", "red"],
        "aesthetic_tags": ["ethnic", "traditional", "diwali-special"],
        "keywords": ["potli", "clutch", "bag"],
        "gender": "Women",
        "image_url": "https://in.kalkifashion.com/products/silver-and-gold-potli-bag-with-crescent-motif"
    },
    {
        "id": "acc_023",
        "name": "diwali pocket square & pin set",
        "category": "Accessory",
        "price": 399,
        "occasions": ["diwali", "festive"],
        "colors": ["maroon", "gold"],
        "aesthetic_tags": ["ethnic", "sleek", "diwali-special"],
        "keywords": ["pocket square", "pin", "brooch"],
        "gender": "Men",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMYvy1L4m94dkkoEbvO2mI4awLf6ZVNGiFilIyTA0kbg&s"
    }
]

# =============================================================================
# LOCAL BOUTIQUES & OUTFIT CIRCLE 
# =============================================================================

LOCAL_BOUTIQUES: List[Dict[str, Any]] = [
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
        "name": "Dilli Rebels Co.",
        "city": "Delhi",
        "rating": 4.5,
        "verified": True,
        "distance_km": 4.0,
        "speciality": "Streetwear & Over-sized Apparel",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    }
]

OUTFIT_GROUPS: List[Dict[str, Any]] = []


# =============================================================================
# ABSTRACT REPOSITORY LAYER
# =============================================================================

class MockDB:
    _table_cache: List[ProductEntity] = []
    _lock: Lock = Lock()
    _synced: bool = False

    @classmethod
    def connect_and_sync(cls) -> None:
        if cls._synced:
            return
        with cls._lock:
            if cls._synced:
                return
            cls._table_cache = [ProductEntity(**product) for product in CATALOG]
            cls._synced = True

    @classmethod
    def execute_select_all(cls) -> List[Dict[str, Any]]:
        cls.connect_and_sync()
        return [entity.model_dump() for entity in cls._table_cache]

    @classmethod
    def get_products(cls) -> List[Dict[str, Any]]:
        return cls.execute_select_all()

    @classmethod
    def get_product(cls, product_id: str) -> Optional[Dict[str, Any]]:
        for product in cls.execute_select_all():
            if product["id"] == product_id:
                return product
        return None

    @classmethod
    def get_bazaar_cities(cls) -> List[Dict[str, str]]:
        """Deprecated: use BazaarRepository.get_bazaar_cities (SQL-backed)."""
        from app.repository.bazaar_repo import BazaarRepository
        return BazaarRepository.get_bazaar_cities()

    @classmethod
    def get_local_bazaar_data(cls, city: Optional[str] = None) -> Dict[str, Any]:
        """Deprecated: use BazaarRepository.get_local_bazaar_data (SQL-backed)."""
        from app.repository.bazaar_repo import BazaarRepository
        return BazaarRepository.get_local_bazaar_data(city)

    @classmethod
    def get_bazaar_theme(cls, festival: Optional[str] = None) -> Dict[str, Any]:
        """Deprecated: use BazaarRepository.get_bazaar_theme (SQL-backed)."""
        from app.repository.bazaar_repo import BazaarRepository
        return BazaarRepository.get_bazaar_theme(festival)

    @classmethod
    def get_boutiques(cls, city: Optional[str] = None) -> List[Dict[str, Any]]:
        return cls.get_local_bazaar_data(city).get("boutiques", [])

    @classmethod
    def get_genie_products(cls) -> List[Dict[str, Any]]:
        category_map = {
            "Topwear": "TOP",
            "Bottomwear": "BOTTOM",
            "Footwear": "FOOTWEAR",
            "Accessory": "ACCESSORY"
        }
        return [
            {**product, "category": category_map.get(product["category"], product["category"])}
            for product in cls.execute_select_all()
        ]

    @classmethod
    def get_genie_product(cls, product_id: str) -> Optional[Dict[str, Any]]:
        for product in cls.get_genie_products():
            if product["id"] == product_id:
                return product
        return None

# --- AUTO-OVERRIDE IMAGE URLS WITH LOCAL FILES ---
import os
from pathlib import Path

# Check frontend/public/catalog for any local images matching product IDs
frontend_catalog_dir = Path(__file__).resolve().parents[3] / "frontend" / "public" / "catalog"

if frontend_catalog_dir.exists():
    for item in CATALOG:
        pid = item["id"]
        for ext in [".png", ".jpg", ".jpeg"]:
            local_file = frontend_catalog_dir / f"{pid}{ext}"
            if local_file.exists():
                item["image_url"] = f"/catalog/{pid}{ext}"
                break

# --- BACKFILL FESTIVAL TAGS & OCCASIONS ---
def _backfill_catalog_tags(catalog_items: List[Dict[str, Any]]) -> None:
    rakhi_footwear_ids = {"foot_005", "foot_010"}
    for item in catalog_items:
        # Every existing item tagged 'festive' gets explicitly tagged 'diwali'
        if "festive" in item.get("occasions", []) and "diwali" not in item["occasions"]:
            item["occasions"].append("diwali")
        # Explicitly tag Raksha Bandhan footwear
        if item["id"] in rakhi_footwear_ids and "raksha bandhan" not in item["occasions"]:
            item["occasions"].append("raksha bandhan")

_backfill_catalog_tags(CATALOG)