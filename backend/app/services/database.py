"""
Module 2 Data Repository — Target Production Schema

This module acts as an in-memory abstraction of the production MySQL relational
schema used by the Core Curation Engine (Module 2). The target schema is
normalized into four tables to support flexible many-to-many tag matching.

Target MySQL Relational Schema:

1. Table `products` (
       id          VARCHAR(64) PRIMARY KEY,
       name        VARCHAR(150) NOT NULL,
       category    ENUM('Topwear', 'Bottomwear', 'Footwear', 'Accessory') NOT NULL,
       price       INT NOT NULL,
       image_url   VARCHAR(255) NOT NULL
   )

2. Table `product_occasions` (
       product_id  VARCHAR(64) NOT NULL,
       occasion    VARCHAR(64) NOT NULL,
       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
       PRIMARY KEY (product_id, occasion)
   )
   -> Many-to-Many relationship linking products to occasions such as Wedding,
      Festive, Formal, Casual, Party, Date.

3. Table `product_colors` (
       product_id  VARCHAR(64) NOT NULL,
       color       VARCHAR(64) NOT NULL,
       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
       PRIMARY KEY (product_id, color)
   )
   -> Many-to-Many relationship linking products to extractable colors.

4. Table `product_aesthetics` (
       product_id  VARCHAR(64) NOT NULL,
       tag         VARCHAR(64) NOT NULL,
       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
       PRIMARY KEY (product_id, tag)
   )
   -> Many-to-Many relationship linking products to style/aesthetic tags such as
      ethnic, minimalist, heavy, sleek, streetwear.

The in-memory `MockDB` class below mirrors this abstraction using a validated
Pydantic ORM entity (`ProductEntity`) and a thread-safe cache (`_table_cache`).
"""

from typing import List, Dict, Any, Optional
from threading import Lock
from pydantic import BaseModel, Field, ConfigDict


# =============================================================================
# PYDANTIC ORM ENTITY
# =============================================================================

class ProductEntity(BaseModel):
    """
    Pydantic model mirroring the production `products` row plus its related
    many-to-many tag tables (occasions, colors, aesthetics).
    """
    id: str
    name: str
    category: str = Field(
        ...,
        pattern="^(Topwear|Bottomwear|Footwear|Accessory)$",
        description="Production ENUM value from the products table"
    )
    price: int = Field(..., ge=300, le=4000, description="Price in INR")
    occasions: List[str] = Field(
        default_factory=list,
        description="Values that would live in the product_occasions join table"
    )
    colors: List[str] = Field(
        default_factory=list,
        description="Values that would live in the product_colors join table"
    )
    aesthetic_tags: List[str] = Field(
        default_factory=list,
        description="Values that would live in the product_aesthetics join table"
    )
    image_url: str = Field(
        ...,
        description="Local transparent mannequin asset path: /catalog/{id}.png"
    )

    model_config = ConfigDict(extra="ignore")


# =============================================================================
# HIGH-FIDELITY IN-LINE SEED CATALOG (50 PRODUCTS)
# Distribution: 15 Topwear, 15 Bottomwear, 10 Footwear, 10 Accessory
# =============================================================================

CATALOG: List[Dict[str, Any]] = [
    # --- TOPWEAR (15) ---
    {
        "id": "top_001",
        "name": "Peplum Kurti",
        "category": "Topwear",
        "price": 1890,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "maroon", "cream"],
        "aesthetic_tags": ["ethnic", "heavy", "traditional"],
        "image_url": "/catalog/top_001.jpg"
    },
    {
        "id": "top_002",
        "name": "Corset",
        "category": "Topwear",
        "price": 3200,
        "occasions": ["Wedding"],
        "colors": ["black", "navy", "wine"],
        "aesthetic_tags": ["ethnic", "heavy", "royal"],
        "image_url": "/catalog/top_002.jpg"
    },
    {
        "id": "top_003",
        "name": "Cotton Kurti",
        "category": "Topwear",
        "price": 1290,
        "occasions": ["Festive", "Casual"],
        "colors": ["white", "pastel", "mint"],
        "aesthetic_tags": ["ethnic", "light", "elegant"],
        "image_url": "/catalog/top_003.jpg"
    },
    {
        "id": "top_004",
        "name": "Peplum Kurti",
        "category": "Topwear",
        "price": 1450,
        "occasions": ["Festive", "Party"],
        "colors": ["red", "orange", "yellow"],
        "aesthetic_tags": ["ethnic", "bright", "traditional"],
        "image_url": "/catalog/top_004.jpg"
    },
    {
        "id": "top_005",
        "name": "Linen Wrap-top",
        "category": "Topwear",
        "price": 890,
        "occasions": ["Casual", "Office"],
        "colors": ["white", "blue", "beige"],
        "aesthetic_tags": ["minimalist", "light", "clean"],
        "image_url": "/catalog/top_005.jpg"
    },
    {
        "id": "top_006",
        "name": "LinenWrap-top",
        "category": "Topwear",
        "price": 590,
        "occasions": ["Casual", "College Fest"],
        "colors": ["black", "white", "grey"],
        "aesthetic_tags": ["streetwear", "relaxed", "urban"],
        "image_url": "/catalog/top_006.jpg"
    },
    {
        "id": "top_007",
        "name": "Woolen Cardigan",
        "category": "Topwear",
        "price": 1100,
        "occasions": ["Casual"],
        "colors": ["black", "navy", "olive"],
        "aesthetic_tags": ["streetwear", "cozy", "minimalist"],
        "image_url": "/catalog/top_007.jpg"
    },
    {
        "id": "top_008",
        "name": "Woolen Cardigan",
        "category": "Topwear",
        "price": 750,
        "occasions": ["Casual", "Office"],
        "colors": ["white", "navy", "burgundy"],
        "aesthetic_tags": ["smart-casual", "sleek", "minimalist"],
        "image_url": "/catalog/top_008.jpg"
    },
    {
        "id": "top_009",
        "name": "Casual Cotton Men's Shirt",
        "category": "Topwear",
        "price": 1650,
        "occasions": ["Casual", "Party"],
        "colors": ["blue", "black"],
        "aesthetic_tags": ["streetwear", "vintage", "layered"],
        "image_url": "/catalog/top_009.jpg"
    },
    {
        "id": "top_010",
        "name": "Knitted Men's Polo T-shirt",
        "category": "Topwear",
        "price": 2400,
        "occasions": ["Formal", "Party"],
        "colors": ["black", "gold", "burgundy"],
        "aesthetic_tags": ["sleek", "heavy", "statement"],
        "image_url": "/catalog/top_010.jpg"
    },
    {
        "id": "top_011",
        "name": "Striped Men's  CottonShirt",
        "category": "Topwear",
        "price": 1350,
        "occasions": ["Party", "Date"],
        "colors": ["black", "silver", "rose"],
        "aesthetic_tags": ["sleek", "glam", "minimalist"],
        "image_url": "/catalog/top_011.jpg"
    },
    {
        "id": "top_012",
        "name": "Men's Jacket",
        "category": "Topwear",
        "price": 980,
        "occasions": ["Festive", "Casual"],
        "colors": ["white", "black", "olive"],
        "aesthetic_tags": ["ethnic", "relaxed", "traditional"],
        "image_url": "/catalog/top_012.png"
    },
    {
        "id": "top_013",
        "name": "Men's black toggle jacket",
        "category": "Topwear",
        "price": 1750,
        "occasions": ["Festive", "Formal"],
        "colors": ["navy", "grey", "mustard"],
        "aesthetic_tags": ["ethnic", "sleek", "structured"],
        "image_url": "/catalog/top_013.jpg"
    },
    {
        "id": "top_014",
        "name": "Girls' Peter Pan collar peplum top",
        "category": "Topwear",
        "price": 450,
        "occasions": ["Casual", "Party"],
        "colors": ["black", "white", "pink"],
        "aesthetic_tags": ["minimalist", "trendy", "casual"],
        "image_url": "/catalog/top_014.jpg"
    },
    {
        "id": "top_015",
        "name": "Girls' striped bow-detail peplum top",
        "category": "Topwear",
        "price": 880,
        "occasions": ["Party", "Date"],
        "colors": ["red", "black", "peach"],
        "aesthetic_tags": ["feminine", "glam", "statement"],
        "image_url": "/catalog/top_015.jpg"
    },

    # --- BOTTOMWEAR (15) ---
    {
        "id": "bottom_001",
        "name": "Silk Churidar Pyjama",
        "category": "Bottomwear",
        "price": 650,
        "occasions": ["Wedding", "Festive"],
        "colors": ["white", "cream", "gold"],
        "aesthetic_tags": ["ethnic", "light", "traditional"],
        "image_url": "/catalog/bot_001.jpg"
    },
    {
        "id": "bottom_002",
        "name": "Cotton Silk Dhoti Pants",
        "category": "Bottomwear",
        "price": 1100,
        "occasions": ["Wedding", "Festive"],
        "colors": ["white", "gold", "beige"],
        "aesthetic_tags": ["ethnic", " airy", "traditional"],
        "image_url": "/catalog/bot_002.jpg"
    },
    {
        "id": "bottom_003",
        "name": "Ivory Palazzo Silk Pants",
        "category": "Bottomwear",
        "price": 890,
        "occasions": ["Festive", "Casual"],
        "colors": ["ivory", "white", "gold"],
        "aesthetic_tags": ["ethnic", "elegant", "flowy"],
        "image_url": "/catalog/bot_003.jpg"
    },
    {
        "id": "bottom_004",
        "name": "Cotton Pyjama Bottoms",
        "category": "Bottomwear",
        "price": 480,
        "occasions": ["Festive", "Casual"],
        "colors": ["white", "black", "grey"],
        "aesthetic_tags": ["ethnic", "comfort", "relaxed"],
        "image_url": "/catalog/bot_004.jpg"
    },
    {
        "id": "bottom_005",
        "name": "Slim Fit Chinos",
        "category": "Bottomwear",
        "price": 990,
        "occasions": ["Casual", "Office"],
        "colors": ["beige", "khaki", "navy"],
        "aesthetic_tags": ["minimalist", "sleek", "smart-casual"],
        "image_url": "/catalog/bot_005.jpg"
    },
    {
        "id": "bottom_006",
        "name": "Multi-Pocket Cargo Pants",
        "category": "Bottomwear",
        "price": 1200,
        "occasions": ["Casual", "College Fest"],
        "colors": ["green", "black", "grey"],
        "aesthetic_tags": ["streetwear", "utility", "trendy"],
        "image_url": "/catalog/bot_006.jpg"
    },
    {
        "id": "bottom_007",
        "name": "Classic Straight Fit Jeans",
        "category": "Bottomwear",
        "price": 1400,
        "occasions": ["Casual"],
        "colors": ["blue", "black"],
        "aesthetic_tags": ["minimalist", "classic", "versatile"],
        "image_url": "/catalog/bot_007.jpg"
    },
    {
        "id": "bottom_008",
        "name": "Tapered Joggers",
        "category": "Bottomwear",
        "price": 650,
        "occasions": ["Casual"],
        "colors": ["black", "grey", "olive"],
        "aesthetic_tags": ["streetwear", "comfort", "relaxed"],
        "image_url": "/catalog/bot_008.jpg"
    },
    {
        "id": "bottom_009",
        "name": "Formal Flat Front Trousers",
        "category": "Bottomwear",
        "price": 1100,
        "occasions": ["Formal", "Office"],
        "colors": ["black", "charcoal", "navy"],
        "aesthetic_tags": ["sleek", "structured", "minimalist"],
        "image_url": "/catalog/bot_009.jpg"
    },
    {
        "id": "bottom_010",
        "name": "Dhoti Style Skirt",
        "category": "Bottomwear",
        "price": 950,
        "occasions": ["Festive", "Casual"],
        "colors": ["white", "gold", "red"],
        "aesthetic_tags": ["ethnic", "flowy", "traditional"],
        "image_url": "/catalog/bot_010.jpg"
    },
    {
        "id": "bottom_011",
        "name": "Sharara Flared Pants",
        "category": "Bottomwear",
        "price": 1600,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "pink", "green"],
        "aesthetic_tags": ["ethnic", "heavy", "glam"],
        "image_url": "/catalog/bot_011.jpg"
    },
    {
        "id": "bottom_012",
        "name": "Harem Style Pants",
        "category": "Bottomwear",
        "price": 780,
        "occasions": ["Casual", "Festive"],
        "colors": ["black", "maroon", "mustard"],
        "aesthetic_tags": ["ethnic", "relaxed", "boho"],
        "image_url": "/catalog/bot_012.jpg"
    },
    {
        "id": "bottom_013",
        "name": "Pencil Cut Skirt",
        "category": "Bottomwear",
        "price": 850,
        "occasions": ["Formal", "Party"],
        "colors": ["black", "navy", "burgundy"],
        "aesthetic_tags": ["sleek", "structured", "elegant"],
        "image_url": "/catalog/bot_013.jpg"
    },
    {
        "id": "bottom_014",
        "name": "Casual Cotton Shorts",
        "category": "Bottomwear",
        "price": 380,
        "occasions": ["Casual"],
        "colors": ["blue", "beige", "black"],
        "aesthetic_tags": ["minimalist", "comfort", "summer"],
        "image_url": "/catalog/bot_014.jpg"
    },
    {
        "id": "bottom_015",
        "name": "Side Stripe Track Pants",
        "category": "Bottomwear",
        "price": 720,
        "occasions": ["Casual"],
        "colors": ["black", "grey", "white"],
        "aesthetic_tags": ["streetwear", "sporty", "relaxed"],
        "image_url": "/catalog/bot_015.jpg"
    },

    # --- FOOTWEAR (10) ---
    {
        "id": "footwear_001",
        "name": "Handcrafted Kolhapuri Juttis",
        "category": "Footwear",
        "price": 890,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "brown", "tan"],
        "aesthetic_tags": ["ethnic", "handcrafted", "traditional"],
        "image_url": "/catalog/foot_001.jpg"
    },
    {
        "id": "footwear_002",
        "name": "Royal Velvet Mojris",
        "category": "Footwear",
        "price": 1200,
        "occasions": ["Wedding", "Festive"],
        "colors": ["black", "maroon", "navy"],
        "aesthetic_tags": ["ethnic", "heavy", "royal"],
        "image_url": "/catalog/foot_002.jpg"
    },
    {
        "id": "footwear_003",
        "name": "Embellished Wedding Sandals",
        "category": "Footwear",
        "price": 750,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "silver", "pink"],
        "aesthetic_tags": ["ethnic", "glam", "delicate"],
        "image_url": "/catalog/foot_003.jpg"
    },
    {
        "id": "footwear_004",
        "name": "Leather Oxford Formal Shoes",
        "category": "Footwear",
        "price": 1800,
        "occasions": ["Formal", "Office"],
        "colors": ["black", "brown"],
        "aesthetic_tags": ["sleek", "classic", "polished"],
        "image_url": "/catalog/foot_004.jpg"
    },
    {
        "id": "footwear_005",
        "name": "Classic White Sneakers",
        "category": "Footwear",
        "price": 1100,
        "occasions": ["Casual"],
        "colors": ["white", "black"],
        "aesthetic_tags": ["minimalist", "clean", "versatile"],
        "image_url": "/catalog/foot_005.jpg"
    },
    {
        "id": "footwear_006",
        "name": "Chunky High-Top Sneakers",
        "category": "Footwear",
        "price": 1350,
        "occasions": ["Casual", "College Fest"],
        "colors": ["white", "blue", "pink"],
        "aesthetic_tags": ["streetwear", "bold", "trendy"],
        "image_url": "/catalog/foot_006.jpg"
    },
    {
        "id": "footwear_007",
        "name": "Casual Leather Loafers",
        "category": "Footwear",
        "price": 990,
        "occasions": ["Casual", "Office"],
        "colors": ["brown", "tan", "black"],
        "aesthetic_tags": ["smart-casual", "sleek", "minimalist"],
        "image_url": "/catalog/foot_007.jpg"
    },
    {
        "id": "footwear_008",
        "name": "Stiletto Heel Pumps",
        "category": "Footwear",
        "price": 1450,
        "occasions": ["Party", "Date"],
        "colors": ["black", "red", "nude"],
        "aesthetic_tags": ["glam", "sleek", "statement"],
        "image_url": "/catalog/foot_008.jpg"
    },
    {
        "id": "footwear_009",
        "name": "Beaded Kolhapuris",
        "category": "Footwear",
        "price": 680,
        "occasions": ["Festive", "Casual"],
        "colors": ["gold", "brown", "red"],
        "aesthetic_tags": ["ethnic", "boho", "handcrafted"],
        "image_url": "/catalog/foot_009.jpg"
    },
    {
        "id": "footwear_010",
        "name": "Ankle Length Boots",
        "category": "Footwear",
        "price": 1700,
        "occasions": ["Casual", "Party"],
        "colors": ["black", "brown"],
        "aesthetic_tags": ["streetwear", "edgy", "versatile"],
        "image_url": "/catalog/foot_010.jpg"
    },

    # --- ACCESSORY (10) ---
    {
        "id": "accessory_001",
        "name": "Gold Plated Kundan Necklace",
        "category": "Accessory",
        "price": 1500,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "green", "red"],
        "aesthetic_tags": ["ethnic", "heavy", "statement"],
        "image_url": "/catalog/acc_001.jpg"
    },
    {
        "id": "accessory_002",
        "name": "Heritage Pearl Strand Necklace",
        "category": "Accessory",
        "price": 1100,
        "occasions": ["Wedding", "Festive"],
        "colors": ["white", "ivory", "gold"],
        "aesthetic_tags": ["elegant", "classic", "ethnic"],
        "image_url": "/catalog/acc_002.jpg"
    },
    {
        "id": "accessory_003",
        "name": "Chronograph Leather Watch",
        "category": "Accessory",
        "price": 680,
        "occasions": ["Casual", "Office"],
        "colors": ["brown", "black", "silver"],
        "aesthetic_tags": ["minimalist", "sleek", "classic"],
        "image_url": "/catalog/acc_003.jpg"
    },
    {
        "id": "accessory_004",
        "name": "Digital Sports Watch",
        "category": "Accessory",
        "price": 490,
        "occasions": ["Casual"],
        "colors": ["black", "blue", "grey"],
        "aesthetic_tags": ["sporty", "minimalist", "functional"],
        "image_url": "/catalog/acc_004.jpg"
    },
    {
        "id": "accessory_005",
        "name": "Aviator Sunglasses",
        "category": "Accessory",
        "price": 950,
        "occasions": ["Casual", "Party"],
        "colors": ["gold", "black", "green"],
        "aesthetic_tags": ["classic", "sleek", "cool"],
        "image_url": "/catalog/acc_005.jpg"
    },
    {
        "id": "accessory_006",
        "name": "Leather Formal Belt",
        "category": "Accessory",
        "price": 550,
        "occasions": ["Formal", "Office"],
        "colors": ["black", "brown"],
        "aesthetic_tags": ["minimalist", "sleek", "essential"],
        "image_url": "/catalog/acc_006.jpg"
    },
    {
        "id": "accessory_007",
        "name": "Silk Pocket Square",
        "category": "Accessory",
        "price": 350,
        "occasions": ["Formal", "Party"],
        "colors": ["blue", "red", "gold"],
        "aesthetic_tags": ["sleek", "minimalist", "polished"],
        "image_url": "/catalog/acc_007.jpg"
    },
    {
        "id": "accessory_008",
        "name": "Embroidered Dupatta",
        "category": "Accessory",
        "price": 780,
        "occasions": ["Wedding", "Festive"],
        "colors": ["red", "gold", "pink"],
        "aesthetic_tags": ["ethnic", "heavy", "traditional"],
        "image_url": "/catalog/acc_008.jpg"
    },
    {
        "id": "accessory_009",
        "name": "Evening Clutch Bag",
        "category": "Accessory",
        "price": 1200,
        "occasions": ["Party", "Date"],
        "colors": ["black", "gold", "silver"],
        "aesthetic_tags": ["glam", "sleek", "statement"],
        "image_url": "/catalog/acc_009.jpg"
    },
    {
        "id": "accessory_010",
        "name": "Layered Bracelet Set",
        "category": "Accessory",
        "price": 420,
        "occasions": ["Casual", "Party"],
        "colors": ["gold", "silver", "black"],
        "aesthetic_tags": ["trendy", "minimalist", "layered"],
        "image_url": "/catalog/acc_010.png"
    }
]


# =============================================================================
# LOCAL BOUTIQUES & OUTFIT CIRCLE (Preserved for downstream compatibility)
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

OUTFIT_GROUPS: List[Dict[str, Any]] = [
    {
        "id": "group_1",
        "name": "Jaipur Wedding Prep",
        "members_count": 4,
        "creator": "Kuhu",
        "items": [
            {
                "id": "item_1",
                "product_id": "top_004",
                "votes": 12,
                "voted_by": ["Kuhu", "Aditi", "Rohan"],
                "comments": [
                    {"user": "Aditi", "text": "This bandhani print is perfect for the Jaipur theme!"},
                    {"user": "Rohan", "text": "Love the festive vibe."}
                ]
            },
            {
                "id": "item_2",
                "product_id": "bottom_011",
                "votes": 5,
                "voted_by": ["Kuhu", "Sneha"],
                "comments": [
                    {"user": "Sneha", "text": "Sharara is gorgeous but may be too heavy for a noon event."}
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
                "product_id": "top_006",
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


# =============================================================================
# ABSTRACT REPOSITORY LAYER
# =============================================================================

class MockDB:
    """
    Production-abstracted in-memory data repository.
    Designed to mirror the eventual MySQL adapter layer with minimal friction.
    """
    _table_cache: List[ProductEntity] = []
    _lock: Lock = Lock()
    _synced: bool = False

    @classmethod
    def connect_and_sync(cls) -> None:
        """
        Thread-safe initialization that validates the seed catalog through the
        Pydantic ORM entity and populates the internal `_table_cache`.
        Mirrors the behaviour of a real ORM session factory.
        """
        if cls._synced:
            return
        with cls._lock:
            if cls._synced:
                return
            cls._table_cache = [ProductEntity(**product) for product in CATALOG]
            cls._synced = True

    @classmethod
    def execute_select_all(cls) -> List[Dict[str, Any]]:
        """
        Database-adapter-style query that returns all validated rows as plain
        dictionaries for downstream curation and filtering calculations.
        """
        cls.connect_and_sync()
        return [entity.model_dump() for entity in cls._table_cache]

    # -------------------------------------------------------------------------
    # Compatibility interfaces used by other API modules
    # -------------------------------------------------------------------------
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
    def get_genie_products(cls) -> List[Dict[str, Any]]:
        """
        Returns the Module-2 catalog with categories mapped to the uppercase
        slot identifiers expected by the curation engine (TOP, BOTTOM, FOOTWEAR, ACCESSORY).
        """
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
        for group in OUTFIT_GROUPS:
            if group["id"] == group_id:
                return group
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
