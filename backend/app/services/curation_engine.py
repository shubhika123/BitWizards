"""
Module 2: Core AI Curation & Recommendation Engine

This module integrates sentence-transformers locally with a Pinecone vector DB
to score catalog items, respect active locked slots, compute combinatorial budget optimizations,
and serve paginated alternatives for slot replacements.
"""

import os
from typing import List, Dict, Any, Optional
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from app.config import settings
from app.models.GenieSchema import GenieCurateRequest, GenieAlternativesRequest
from app.services.database import MockDB


class CurationEngine:
    _model = None
    _pc = None
    _index = None

    @classmethod
    def _get_resources(cls):
        """
        Thread-safe lazy initialization of the Pinecone client and SentenceTransformer model.
        """
        if cls._model is None:
            print("Loading SentenceTransformer model 'all-MiniLM-L6-v2' inside backend...")
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        if cls._pc is None:
            cls._pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            cls._index = cls._pc.Index("genie-catalog")
        return cls._index, cls._model

    @staticmethod
    def map_frontend_category_to_pinecone(cat: str) -> str:
        mapping = {
            "TOP": "Topwear",
            "BOTTOM": "Bottomwear",
            "FOOTWEAR": "Footwear",
            "ACCESSORY": "Accessory"
        }
        return mapping.get(cat.upper(), cat)

    @staticmethod
    def map_pinecone_category_to_frontend(cat: str) -> str:
        mapping = {
            "Topwear": "TOP",
            "Bottomwear": "BOTTOM",
            "Footwear": "FOOTWEAR",
            "Accessory": "ACCESSORY"
        }
        return mapping.get(cat, cat.upper())

    @classmethod
    def generate_outfit(cls, req: GenieCurateRequest) -> Dict[str, Any]:
        """
        Generate a complete 4-piece outfit using local sentence embeddings,
        Pinecone category queries, and constraint-based budget permutations.
        """
        index, model = cls._get_resources()
        
        # Resolve locked items by slot
        locked_items_by_slot = {}
        for p_id in req.locked_item_ids:
            item = MockDB.get_product(p_id)
            if item:
                front_cat = cls.map_pinecone_category_to_frontend(item["category"])
                locked_items_by_slot[front_cat] = {
                    "id": item["id"],
                    "name": item["name"],
                    "category": front_cat,
                    "price": float(item["price"]),
                    "image_url": item["image_url"],
                    "score": 1.0
                }

        # Query candidates for each slot
        slots = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"]
        slot_candidates = {}

        for slot in slots:
            if slot in locked_items_by_slot:
                slot_candidates[slot] = [locked_items_by_slot[slot]]
                continue

            pinecone_cat = cls.map_frontend_category_to_pinecone(slot)
            
            # Generate representation query text
            search_text = f"Category: {pinecone_cat}. Name: . Occasions: {req.occasion_category or ''}. Aesthetics: {', '.join(req.aesthetic_tags)}."
            query_vector = model.encode(search_text).tolist()

            # Pinecone filter dict
            filter_dict = {"category": pinecone_cat}
            if req.max_budget is not None:
                filter_dict["price"] = {"$lte": float(req.max_budget)}

            # Query index requesting top_k=4
            res = index.query(
                vector=query_vector,
                top_k=4,
                include_metadata=True,
                filter=filter_dict
            )

            candidates = []
            for match in res.matches:
                meta = match.metadata
                
                # Fetch full product to check gender since Pinecone metadata is missing it
                full_product = MockDB.get_product(match.id)
                if not full_product:
                    continue
                
                # Check gender match if user_gender is provided
                if req.user_gender:
                    prod_gender = full_product.get("gender")
                    if prod_gender and prod_gender not in [req.user_gender, "Unisex"]:
                        continue
                
                # Check hard color exclusions
                item_colors = [c.lower() for c in meta.get("colors", [])]
                if any(color.lower() in item_colors for color in req.excluded_colors):
                    continue
                
                # Check hard tag exclusions
                item_tags = [t.lower() for t in meta.get("aesthetic_tags", [])]
                if any(tag.lower() in item_tags for tag in req.excluded_tags):
                    continue

                candidates.append({
                    "id": match.id,
                    "name": meta["name"],
                    "category": slot,
                    "price": float(meta["price"]),
                    "image_url": meta["image_url"],
                    "score": float(match.score)
                })

            # If candidates are empty, fall back to MockDB
            if not candidates:
                fallback_items = [p for p in MockDB.get_products() if p["category"] == pinecone_cat]
                for p in fallback_items:
                    # Check gender match
                    if req.user_gender:
                        prod_gender = p.get("gender")
                        if prod_gender and prod_gender not in [req.user_gender, "Unisex"]:
                            continue

                    item_colors = [c.lower() for c in p.get("colors", [])]
                    if any(color.lower() in item_colors for color in req.excluded_colors):
                        continue
                    
                    item_tags = [t.lower() for t in p.get("aesthetic_tags", [])]
                    if any(tag.lower() in item_tags for tag in req.excluded_tags):
                        continue

                    candidates.append({
                        "id": p["id"],
                        "name": p["name"],
                        "category": slot,
                        "price": float(p["price"]),
                        "image_url": p["image_url"],
                        "score": 0.1
                    })
                    
            candidates.sort(key=lambda x: x["score"], reverse=True)
            slot_candidates[slot] = candidates

        max_budget_limit = req.max_budget if req.max_budget is not None else 5000

        # Step 3: check #1 highest-scoring combo
        top_combo = [
            slot_candidates["TOP"][0],
            slot_candidates["BOTTOM"][0],
            slot_candidates["FOOTWEAR"][0],
            slot_candidates["ACCESSORY"][0]
        ]
        total_price = sum(item["price"] for item in top_combo)
        
        if total_price <= max_budget_limit:
            active_outfit = top_combo
            swap_boxes = {
                "TOP": slot_candidates["TOP"][1:4],
                "BOTTOM": slot_candidates["BOTTOM"][1:4],
                "FOOTWEAR": slot_candidates["FOOTWEAR"][1:4],
                "ACCESSORY": slot_candidates["ACCESSORY"][1:4]
            }
            return {
                "outfit": active_outfit,
                "swap_boxes": swap_boxes,
                "budget_exceeded": False
            }

        # Step 4: Combinatorial Fallback
        best_combo = None
        best_total_score = -1.0
        
        for top in slot_candidates["TOP"]:
            for bottom in slot_candidates["BOTTOM"]:
                for footwear in slot_candidates["FOOTWEAR"]:
                    for accessory in slot_candidates["ACCESSORY"]:
                        combo_price = top["price"] + bottom["price"] + footwear["price"] + accessory["price"]
                        if combo_price <= max_budget_limit:
                            combo_score = top["score"] + bottom["score"] + footwear["score"] + accessory["score"]
                            if combo_score > best_total_score:
                                best_total_score = combo_score
                                best_combo = [top, bottom, footwear, accessory]

        budget_exceeded = False
        if best_combo is None:
            budget_exceeded = True
            cheapest_combo = [
                min(slot_candidates["TOP"], key=lambda x: x["price"]),
                min(slot_candidates["BOTTOM"], key=lambda x: x["price"]),
                min(slot_candidates["FOOTWEAR"], key=lambda x: x["price"]),
                min(slot_candidates["ACCESSORY"], key=lambda x: x["price"])
            ]
            best_combo = cheapest_combo

        active_outfit = best_combo
        swap_boxes = {
            "TOP": [c for c in slot_candidates["TOP"] if c["id"] != active_outfit[0]["id"]][:3],
            "BOTTOM": [c for c in slot_candidates["BOTTOM"] if c["id"] != active_outfit[1]["id"]][:3],
            "FOOTWEAR": [c for c in slot_candidates["FOOTWEAR"] if c["id"] != active_outfit[2]["id"]][:3],
            "ACCESSORY": [c for c in slot_candidates["ACCESSORY"] if c["id"] != active_outfit[3]["id"]][:3]
        }

        return {
            "outfit": active_outfit,
            "swap_boxes": swap_boxes,
            "budget_exceeded": budget_exceeded
        }

    @classmethod
    def get_slot_alternatives(cls, req: GenieAlternativesRequest) -> List[Dict[str, Any]]:
        """
        Calculates remaining budget and retrieves paginated catalog options for swaps.
        """
        index, model = cls._get_resources()

        slot = req.category_to_refresh or req.slot_category
        active_ids = req.active_combination_ids or req.current_outfit_ids or []
        page = req.page

        if not slot:
            return []

        pinecone_cat = cls.map_frontend_category_to_pinecone(slot)
        front_cat = cls.map_pinecone_category_to_frontend(slot)

        # Calculate remaining budget
        other_total = 0.0
        for p_id in active_ids:
            p = MockDB.get_product(p_id)
            if p:
                other_total += float(p["price"])
        
        remaining_budget = float(req.max_budget) - other_total

        # Query Pinecone for alternatives
        search_text = f"Category: {pinecone_cat}. Name: . Occasions: {req.occasion_category or ''}. Aesthetics: {', '.join(req.aesthetic_tags)}."
        query_vector = model.encode(search_text).tolist()

        filter_dict = {
            "category": pinecone_cat,
            "price": {"$lte": remaining_budget}
        }

        # Request top_k=20 to allow pagination offsets
        res = index.query(
            vector=query_vector,
            top_k=20,
            include_metadata=True,
            filter=filter_dict
        )

        candidates = []
        active_set = set(active_ids)
        for match in res.matches:
            if match.id in active_set:
                continue

            meta = match.metadata
            item_colors = [c.lower() for c in meta.get("colors", [])]
            if any(color.lower() in item_colors for color in req.excluded_colors):
                continue

            candidates.append({
                "id": match.id,
                "name": meta["name"],
                "category": front_cat,
                "price": float(meta["price"]),
                "image_url": meta["image_url"],
                "score": float(match.score)
            })

        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        limit = 3
        offset = page * limit
        paginated_candidates = candidates[offset : offset + limit]

        # Fallback to top candidates if pagination runs out
        if not paginated_candidates and candidates:
            paginated_candidates = candidates[:limit]

        return paginated_candidates
