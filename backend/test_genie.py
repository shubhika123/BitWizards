import os
import sys
import json
import logging

# Suppress log spams
logging.basicConfig(level=logging.ERROR)

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.llm_service import LLMService
from app.services.curation_engine import CurationEngine
from app.models.GenieSchema import GenieCurateRequest
from app.database import Session, engine

query = "Casual office wear outfit under 5000"
print(f"### Query: \"{query}\"\n")

# 1. Groq Parse
parsed = LLMService.parse_genie_query(query)
print("### 1. Groq Parsed JSON Response")
print("```json")
print(json.dumps(parsed, indent=2))
print("```\n")

# 2. Pinecone Raw Matches
req = GenieCurateRequest(**parsed)
req.query = query

index = CurationEngine._get_resources()
slots = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"]

print("### 2. Raw Pinecone Search Matches (Top 3 per Slot)")
print("| Slot | Product ID | Name | Vector Score | Metadata Price |")
print("| --- | --- | --- | --- | --- |")

for slot in slots:
    pinecone_cat = CurationEngine.map_frontend_category_to_pinecone(slot)
    search_text = f"Category: {pinecone_cat}. Name: {', '.join(req.target_items)}. Occasion: {req.occasion_category or ''}. Aesthetics: {', '.join(req.aesthetic_tags)}."
    query_vector = CurationEngine._get_embedding(search_text)
    
    filter_dict = {"category": pinecone_cat}
    if req.max_budget is not None:
        filter_dict["price"] = {"$lte": float(req.max_budget)}
    
    res = index.query(
        vector=query_vector,
        top_k=3,
        include_metadata=True,
        filter=filter_dict
    )
    
    for match in res.matches:
        name = match.metadata.get("name", "Unknown")
        price = match.metadata.get("price", "N/A")
        print(f"| {slot} | {match.id} | {name} | {match.score:.4f} | ₹{price} |")

print("\n")

# 3. Final Outfit Selection (After Curation Engine Logic)
with Session(engine) as session:
    result = CurationEngine.generate_outfit(req, session)

print("### 3. Final Curated Outfit (After Lexical Boost & Harmony Constraints)")
print("| Slot | Name | Price | Final Score |")
print("| --- | --- | --- | --- |")
total_price = 0
for item in result["outfit"]:
    total_price += item['price']
    print(f"| {item['category']} | {item['name']} | ₹{item['price']} | {item.get('score', 0.0):.4f} |")
print(f"| **TOTAL** | | **₹{total_price}** | |")
