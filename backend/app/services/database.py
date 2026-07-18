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
    image_url: str = Field(...)
    gender: str = Field(default="Unisex")

    model_config = ConfigDict(extra="ignore")


CATALOG: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # TOPWEAR (16 Items)
    # -------------------------------------------------------------------------
    {
        "id": "top_001",
        "name": "Oversized 'Syntax Error' Graphic Tee",
        "category": "Topwear",
        "price": 699,
        "occasions": ["Casual", "College Fest"],
        "colors": ["black", "neon green"],
        "aesthetic_tags": ["streetwear", "tech-core", "baggy", "dark"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_002",
        "name": "Drop-Shoulder Flannel Overshirt",
        "category": "Topwear",
        "price": 1199,
        "occasions": ["Casual", "Party", "Date"],
        "colors": ["red", "black", "grey"],
        "aesthetic_tags": ["streetwear", "layering", "grunge", "winter"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_003",
        "name": "Heavyweight Boxy Hoodie",
        "category": "Topwear",
        "price": 1499,
        "occasions": ["Casual", "College Fest"],
        "colors": ["olive", "dark green"],
        "aesthetic_tags": ["streetwear", "minimalist", "cozy", "winter"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_004",
        "name": "Vintage Washed Denim Jacket",
        "category": "Topwear",
        "price": 1899,
        "occasions": ["Casual", "Party"],
        "colors": ["blue", "faded blue"],
        "aesthetic_tags": ["vintage", "layering", "classic", "rugged"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0efa?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_005",
        "name": "Lucknowi Chikankari Short Kurta",
        "category": "Topwear",
        "price": 1250,
        "occasions": ["Festive", "Wedding"],
        "colors": ["mint", "pastel green", "white"],
        "aesthetic_tags": ["ethnic", "elegant", "light", "fusion"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_006",
        "name": "Asymmetric Silk Blend Kurta",
        "category": "Topwear",
        "price": 1599,
        "occasions": ["Festive", "Wedding", "Party"],
        "colors": ["mustard", "yellow", "gold"],
        "aesthetic_tags": ["ethnic", "modern", "vibrant", "haldi"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1583391733959-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_007",
        "name": "Textured Bandhgala Nehru Jacket",
        "category": "Topwear",
        "price": 2100,
        "occasions": ["Wedding", "Formal"],
        "colors": ["navy", "black"],
        "aesthetic_tags": ["ethnic", "royal", "structured", "layering"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_008",
        "name": "Ribbed Halter Crop Top",
        "category": "Topwear",
        "price": 499,
        "occasions": ["Casual", "College Fest", "Party"],
        "colors": ["black", "white"],
        "aesthetic_tags": ["minimalist", "y2k", "sleek", "summer"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_009",
        "name": "Crochet Boxy Cardigan",
        "category": "Topwear",
        "price": 999,
        "occasions": ["Casual", "Date"],
        "colors": ["cream", "beige"],
        "aesthetic_tags": ["boho", "vintage", "textured", "cozy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1434389678369-e8412675d0f6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_010",
        "name": "Oversized Graphic Anime Tee",
        "category": "Topwear",
        "price": 699,
        "occasions": ["Casual", "College Fest"],
        "colors": ["white", "pink", "purple"],
        "aesthetic_tags": ["streetwear", "baggy", "gen-z", "kawaii"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_011",
        "name": "Faux Leather Corset Top",
        "category": "Topwear",
        "price": 1199,
        "occasions": ["Party", "Date"],
        "colors": ["black", "maroon"],
        "aesthetic_tags": ["edgy", "glam", "statement", "night-out"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1550614000-4b95dd2475a3?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_012",
        "name": "Mirror Work Peplum Kurti",
        "category": "Topwear",
        "price": 1499,
        "occasions": ["Festive", "Wedding"],
        "colors": ["hot pink", "magenta", "silver"],
        "aesthetic_tags": ["ethnic", "glam", "vibrant", "heavy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_013",
        "name": "Bandhani Print Angrakha",
        "category": "Topwear",
        "price": 1299,
        "occasions": ["Festive", "Casual"],
        "colors": ["red", "orange"],
        "aesthetic_tags": ["ethnic", "traditional", "flowy", "bright"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_014",
        "name": "Foil Print Strappy Blouse",
        "category": "Topwear",
        "price": 899,
        "occasions": ["Wedding", "Party"],
        "colors": ["gold", "cream"],
        "aesthetic_tags": ["ethnic", "fusion", "glam", "sleek"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1574041705602-5ea912eb929d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_015",
        "name": "Cotton Anarkali Kurta",
        "category": "Topwear",
        "price": 1100,
        "occasions": ["Festive", "Office"],
        "colors": ["yellow", "mustard"],
        "aesthetic_tags": ["ethnic", "elegant", "haldi", "flowy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1617260537877-cd5f4ccda364?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "top_016",
        "name": "Solid Satin Shirt",
        "category": "Topwear",
        "price": 999,
        "occasions": ["Formal", "Party", "Date"],
        "colors": ["emerald green", "navy"],
        "aesthetic_tags": ["sleek", "elegant", "minimalist", "premium"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # BOTTOMWEAR (14 Items)
    # -------------------------------------------------------------------------
    {
        "id": "bot_001",
        "name": "Tech-wear Multi-Pocket Cargos",
        "category": "Bottomwear",
        "price": 1499,
        "occasions": ["Casual", "College Fest"],
        "colors": ["black", "charcoal"],
        "aesthetic_tags": ["streetwear", "tech-core", "utility", "baggy"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_002",
        "name": "Baggy Nylon Parachute Pants",
        "category": "Bottomwear",
        "price": 1299,
        "occasions": ["Casual", "Party"],
        "colors": ["beige", "tan", "khaki"],
        "aesthetic_tags": ["streetwear", "y2k", "relaxed", "trendy"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1549037173-e3b710c541d6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_003",
        "name": "Washed Wide-Leg Denim",
        "category": "Bottomwear",
        "price": 1699,
        "occasions": ["Casual", "Date"],
        "colors": ["blue", "light blue"],
        "aesthetic_tags": ["streetwear", "vintage", "baggy", "casual"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_004",
        "name": "Premium Slim Fit Chinos",
        "category": "Bottomwear",
        "price": 1199,
        "occasions": ["Formal", "Office", "Date"],
        "colors": ["navy", "black", "olive"],
        "aesthetic_tags": ["minimalist", "smart-casual", "sleek", "tailored"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_005",
        "name": "Cotton Blend Aligarh Pyjama",
        "category": "Bottomwear",
        "price": 699,
        "occasions": ["Festive", "Wedding"],
        "colors": ["white", "cream", "off-white"],
        "aesthetic_tags": ["ethnic", "traditional", "comfort", "light"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1582531393666-4c4bc477eb57?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_006",
        "name": "Pleated Silk Dhoti Pants",
        "category": "Bottomwear",
        "price": 1200,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "beige"],
        "aesthetic_tags": ["ethnic", "royal", "flowy", "traditional"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1596489370005-cb6d860d5dd7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_007",
        "name": "High-Waist Flared Cargo Pants",
        "category": "Bottomwear",
        "price": 1399,
        "occasions": ["Casual", "College Fest", "Party"],
        "colors": ["olive", "khaki", "brown"],
        "aesthetic_tags": ["streetwear", "y2k", "utility", "trendy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_008",
        "name": "Distressed Mom Jeans",
        "category": "Bottomwear",
        "price": 1499,
        "occasions": ["Casual", "Date"],
        "colors": ["grey", "washed black"],
        "aesthetic_tags": ["vintage", "grunge", "relaxed", "casual"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_009",
        "name": "Pleated Tennis Skirt",
        "category": "Bottomwear",
        "price": 799,
        "occasions": ["Casual", "Party"],
        "colors": ["white", "plaid", "black"],
        "aesthetic_tags": ["y2k", "preppy", "summer", "kawaii"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_010",
        "name": "Flared Crepe Trousers",
        "category": "Bottomwear",
        "price": 1099,
        "occasions": ["Formal", "Office", "Party"],
        "colors": ["black", "navy", "maroon"],
        "aesthetic_tags": ["sleek", "elegant", "minimalist", "tailored"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1509631179647-0c708bd226ee?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_011",
        "name": "Gotta Patti Sharara Pants",
        "category": "Bottomwear",
        "price": 1799,
        "occasions": ["Wedding", "Festive"],
        "colors": ["pink", "magenta", "gold"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "flowy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1610034639377-50a80e7741d4?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_012",
        "name": "Printed Cotton Flared Palazzo",
        "category": "Bottomwear",
        "price": 899,
        "occasions": ["Festive", "Casual"],
        "colors": ["yellow", "white", "mustard"],
        "aesthetic_tags": ["ethnic", "comfort", "vibrant", "boho"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1583391733975-4b693245eb0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "bot_013",
        "name": "Brocade Silk Straight Pants",
        "category": "Bottomwear",
        "price": 1299,
        "occasions": ["Wedding", "Festive", "Party"],
        "colors": ["gold", "cream"],
        "aesthetic_tags": ["ethnic", "fusion", "sleek", "premium"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1574041705602-5ea912eb929d?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # FOOTWEAR (12 Items)
    # -------------------------------------------------------------------------
    {
        "id": "foot_001",
        "name": "Chunky Cyber Sneakers",
        "category": "Footwear",
        "price": 1899,
        "occasions": ["Casual", "College Fest"],
        "colors": ["black", "neon green", "grey"],
        "aesthetic_tags": ["streetwear", "tech-core", "chunky", "statement"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_002",
        "name": "Classic White Platform Sneakers",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["Casual", "Date", "Party"],
        "colors": ["white", "off-white"],
        "aesthetic_tags": ["minimalist", "clean", "versatile", "streetwear"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_003",
        "name": "Suede Chelsea Boots",
        "category": "Footwear",
        "price": 2100,
        "occasions": ["Formal", "Party", "Date"],
        "colors": ["brown", "tan", "black"],
        "aesthetic_tags": ["smart-casual", "sleek", "classic", "winter"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_004",
        "name": "Handcrafted Kolhapuri Sandals",
        "category": "Footwear",
        "price": 899,
        "occasions": ["Festive", "Wedding", "Casual"],
        "colors": ["tan", "brown"],
        "aesthetic_tags": ["ethnic", "traditional", "rugged", "comfort"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_005",
        "name": "Velvet Embroidered Mojris",
        "category": "Footwear",
        "price": 1450,
        "occasions": ["Wedding", "Festive"],
        "colors": ["navy", "black", "gold"],
        "aesthetic_tags": ["ethnic", "royal", "heavy", "statement"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_006",
        "name": "Pastel Colorblock Sneakers",
        "category": "Footwear",
        "price": 1499,
        "occasions": ["Casual", "College Fest"],
        "colors": ["pink", "mint", "white"],
        "aesthetic_tags": ["streetwear", "kawaii", "vibrant", "y2k"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_007",
        "name": "Strappy Stiletto Heels",
        "category": "Footwear",
        "price": 1699,
        "occasions": ["Party", "Date", "Wedding"],
        "colors": ["black", "silver", "red"],
        "aesthetic_tags": ["glam", "sleek", "night-out", "elegant"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_008",
        "name": "Woven Faux Leather Mules",
        "category": "Footwear",
        "price": 999,
        "occasions": ["Casual", "Office", "Date"],
        "colors": ["beige", "tan", "cream"],
        "aesthetic_tags": ["minimalist", "smart-casual", "boho", "comfort"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1535043934128-d8f99333a921?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_009",
        "name": "Embellished Wedge Sandals",
        "category": "Footwear",
        "price": 1299,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "rose gold"],
        "aesthetic_tags": ["ethnic", "glam", "heavy", "traditional"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "foot_010",
        "name": "Beaded Flat Juttis",
        "category": "Footwear",
        "price": 799,
        "occasions": ["Festive", "Casual"],
        "colors": ["yellow", "mustard", "multicolor"],
        "aesthetic_tags": ["ethnic", "vibrant", "handcrafted", "haldi"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
    },

    # -------------------------------------------------------------------------
    # ACCESSORIES (12 Items)
    # -------------------------------------------------------------------------
    {
        "id": "acc_001",
        "name": "Matte Black Metal Chain Pendant",
        "category": "Accessory",
        "price": 349,
        "occasions": ["Casual", "College Fest", "Party"],
        "colors": ["black", "dark grey"],
        "aesthetic_tags": ["streetwear", "edgy", "minimalist", "tech-core"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_002",
        "name": "Nylon Tech Crossbody Bag",
        "category": "Accessory",
        "price": 699,
        "occasions": ["Casual", "College Fest"],
        "colors": ["olive", "black", "neon"],
        "aesthetic_tags": ["streetwear", "utility", "baggy", "functional"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_003",
        "name": "Digital Retro Chronograph Watch",
        "category": "Accessory",
        "price": 899,
        "occasions": ["Casual", "Office", "Date"],
        "colors": ["silver", "black"],
        "aesthetic_tags": ["minimalist", "vintage", "classic", "geek"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_004",
        "name": "Tinted Aviator Sunglasses",
        "category": "Accessory",
        "price": 599,
        "occasions": ["Casual", "Party"],
        "colors": ["gold", "green", "brown"],
        "aesthetic_tags": ["classic", "vintage", "statement"],
        "gender": "Unisex",
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_005",
        "name": "Silk Pocket Square & Brooch Set",
        "category": "Accessory",
        "price": 450,
        "occasions": ["Wedding", "Formal"],
        "colors": ["maroon", "gold", "navy"],
        "aesthetic_tags": ["ethnic", "royal", "sleek", "premium"],
        "gender": "Men",
        "image_url": "https://images.unsplash.com/photo-1613588718956-c2e8f29ea156?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_006",
        "name": "Oxidised Silver Jhumkas",
        "category": "Accessory",
        "price": 399,
        "occasions": ["Festive", "Wedding", "College Fest"],
        "colors": ["silver", "oxidised"],
        "aesthetic_tags": ["ethnic", "boho", "heavy", "traditional"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_007",
        "name": "Kundan & Pearl Choker Set",
        "category": "Accessory",
        "price": 1299,
        "occasions": ["Wedding", "Festive"],
        "colors": ["gold", "white", "pink"],
        "aesthetic_tags": ["ethnic", "royal", "glam", "heavy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1599643478524-fb524b0b14c1?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_008",
        "name": "Embroidered Silk Potli Bag",
        "category": "Accessory",
        "price": 599,
        "occasions": ["Wedding", "Festive"],
        "colors": ["magenta", "gold", "yellow"],
        "aesthetic_tags": ["ethnic", "traditional", "vibrant", "haldi"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_009",
        "name": "Y2K Mini Shoulder Bag",
        "category": "Accessory",
        "price": 799,
        "occasions": ["Casual", "Party", "Date"],
        "colors": ["black", "silver"],
        "aesthetic_tags": ["y2k", "streetwear", "minimalist", "trendy"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_010",
        "name": "Layered Gold Chain Necklace",
        "category": "Accessory",
        "price": 499,
        "occasions": ["Casual", "Party", "Office"],
        "colors": ["gold"],
        "aesthetic_tags": ["minimalist", "sleek", "elegant", "everyday"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80"
    },
    {
        "id": "acc_011",
        "name": "Floral Hair Gajra Accessory",
        "category": "Accessory",
        "price": 350,
        "occasions": ["Wedding", "Festive"],
        "colors": ["white", "yellow", "orange"],
        "aesthetic_tags": ["ethnic", "traditional", "vibrant", "floral"],
        "gender": "Women",
        "image_url": "https://images.unsplash.com/photo-1588616140502-3c1a84f3eb3c?auto=format&fit=crop&w=400&q=80"
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