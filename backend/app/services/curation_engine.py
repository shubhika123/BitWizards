"""
Module 2: Core AI Curation & Recommendation Engine

This module integrates sentence-transformers locally with a Pinecone vector DB
to score catalog items, respect active locked slots, compute combinatorial budget optimizations,
and serve paginated alternatives for slot replacements.
"""

import os
import logging
import requests
from typing import List, Dict, Any, Optional
from pinecone import Pinecone
from app.config import settings
from app.models.GenieSchema import GenieCurateRequest, GenieAlternativesRequest
from app.services.database import MockDB

logger = logging.getLogger("app.services.curation_engine")


# --- RUNTIME DNS PATCH FOR DEPLOYMENT ENVIRONMENT (RENDER) ---
import urllib3.util.connection as connection

_hf_resolved_ip = None

def get_hf_ip():
    global _hf_resolved_ip
    if _hf_resolved_ip:
        return _hf_resolved_ip
    
    # Try Cloudflare DNS-over-HTTPS (DoH)
    try:
        r = requests.get("https://cloudflare-dns.com/dns-query?name=api-inference.huggingface.co&type=A", 
                         headers={"accept": "application/dns-json"}, timeout=3)
        if r.ok:
            answers = r.json().get("Answer", [])
            for ans in answers:
                if ans.get("type") == 1:
                    _hf_resolved_ip = ans.get("data")
                    logger.info(f"Resolved api-inference.huggingface.co to {_hf_resolved_ip} via Cloudflare DoH")
                    return _hf_resolved_ip
    except Exception:
        pass
        
    # Try Google DNS-over-HTTPS (DoH)
    try:
        r = requests.get("https://dns.google/resolve?name=api-inference.huggingface.co&type=A", timeout=3)
        if r.ok:
            answers = r.json().get("Answer", [])
            for ans in answers:
                if ans.get("type") == 1:
                    _hf_resolved_ip = ans.get("data")
                    logger.info(f"Resolved api-inference.huggingface.co to {_hf_resolved_ip} via Google DoH")
                    return _hf_resolved_ip
    except Exception:
        pass
        
    # Static hardcoded Virginia AWS load balancer IP fallback
    _hf_resolved_ip = "3.235.136.216"
    logger.warning(f"DoH resolution failed. Falling back to static IP: {_hf_resolved_ip}")
    return _hf_resolved_ip

# Store original create_connection
if not hasattr(connection, "org_create_connection"):
    connection.org_create_connection = connection.create_connection

def patched_create_connection(address, *args, **kwargs):
    host, port = address
    if host == "api-inference.huggingface.co":
        target_ip = get_hf_ip()
        return connection.org_create_connection((target_ip, port), *args, **kwargs)
    return connection.org_create_connection(address, *args, **kwargs)

connection.create_connection = patched_create_connection


class CurationEngine:
    _model = None
    _pc = None
    _index = None

    @classmethod
    def _get_resources(cls):
        """
        Thread-safe lazy initialization of the Pinecone client.
        """
        if cls._pc is None:
            cls._pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            cls._index = cls._pc.Index("genie-catalog")
        return cls._index

    @classmethod
    def _get_embedding(cls, text: str) -> List[float]:
        """
        Retrieves embedding vector from HuggingFace Inference API, falling back
        locally to sentence-transformers if not set or failed (and not on Render).
        """
        if settings.HF_API_KEY:
            try:
                # Use the standard HuggingFace Inference API model endpoint
                url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
                headers = {"Authorization": f"Bearer {settings.HF_API_KEY}"}
                response = requests.post(url, headers=headers, json={"inputs": text}, timeout=10)
                response.raise_for_status()
                res_data = response.json()
                if isinstance(res_data, list) and res_data:
                    if isinstance(res_data[0], float):
                        return res_data
                    elif isinstance(res_data[0], list):
                        return res_data[0]
            except Exception as e:
                logger.error(f"HuggingFace API embedding failed: {e}", exc_info=True)
                if os.environ.get("RENDER") == "true":
                    logger.error("Local fallback disabled on Render to prevent OOM crash.")
                    raise RuntimeError("HuggingFace API embedding failed and local fallback is disabled on Render.") from e
                logger.warning("Trying local fallback...")
        
        if os.environ.get("RENDER") == "true":
            raise RuntimeError("HuggingFace API key is missing or failed, and local fallback is disabled on Render.")

        if cls._model is None:
            logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2' inside emulation engine...")
            from sentence_transformers import SentenceTransformer
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._model.encode(text).tolist()

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

    @staticmethod
    def _is_gender_mismatched(user_gender: Optional[str], product_gender: Optional[str]) -> bool:
        """
        Defensive case-insensitive evaluation checking common gender inputs 
        against catalog attributes.
        """
        if not user_gender or not product_gender:
            return False
            
        u_g = str(user_gender).strip().lower()
        p_g = str(product_gender).strip().lower()
        
        if p_g == "unisex":
            return False
            
        is_user_women = "wom" in u_g or "fem" in u_g
        is_prod_women = "wom" in p_g or "fem" in p_g
        
        is_user_men = "men" in u_g or "male" in u_g and not is_user_women
        is_prod_men = "men" in p_g or "male" in p_g and not is_prod_women
        
        if is_user_women and is_prod_women:
            return False
        if is_user_men and is_prod_men:
            return False
            
        return True

    @classmethod
    def generate_outfit(cls, req: GenieCurateRequest) -> Dict[str, Any]:
        """
        Generate a complete, cohesive 4-piece outfit using local sentence embeddings,
        Pinecone category queries, and constraint-based budget permutations.
        """
        index = cls._get_resources()
        SEMANTIC_SCORE_THRESHOLD = 0.40
        
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
                    "score": 1.0,
                    "tags": item.get("aesthetic_tags", []),
                    "occasions": item.get("occasions", [])
                }

        slots = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"]
        slot_candidates = {}

        target_items = getattr(req, "target_items", [])
        target_str = ", ".join(target_items) if target_items else ""
        
        # Used for the Contextual Vibe Gate
        raw_query = getattr(req, "query", "").lower()

        for slot in slots:
            if slot in locked_items_by_slot:
                slot_candidates[slot] = [locked_items_by_slot[slot]]
                continue

            pinecone_cat = cls.map_frontend_category_to_pinecone(slot)
            
            # STABLE SEARCH TEXT (Do not change this order)
            search_text = f"Category: {pinecone_cat}. Name: {target_str}. Occasion: {req.occasion_category or ''}. Aesthetics: {', '.join(req.aesthetic_tags)}."
            query_vector = cls._get_embedding(search_text)

            # PINECONE DB FILTER SETUP
            filter_dict = {"category": pinecone_cat}
            
            if req.max_budget is not None:
                filter_dict["price"] = {"$lte": float(req.max_budget)}
            
            if req.user_gender:
                g_val = str(req.user_gender).strip()
                filter_dict["gender"] = {"$in": [g_val, g_val.lower(), g_val.title(), g_val.upper(), "Unisex"]}
                
            if req.excluded_colors:
                banned_colors = [str(c).lower().strip() for c in req.excluded_colors]
                filter_dict["colors"] = {"$nin": banned_colors}
                
            if req.excluded_tags:
                banned_tags = [str(t).lower().strip() for t in req.excluded_tags]
                filter_dict["aesthetic_tags"] = {"$nin": banned_tags}

            res = index.query(
                vector=query_vector,
                top_k=20, 
                include_metadata=True,
                filter=filter_dict
            )


            candidates = []
            for match in res.matches:
                match_score = float(match.score)
                if match_score < SEMANTIC_SCORE_THRESHOLD:
                    continue

                meta = match.metadata
                full_product = MockDB.get_product(match.id)
                if not full_product:
                    continue
                
                if cls._is_gender_mismatched(req.user_gender, full_product.get("gender")):
                    continue
                
                raw_colors = meta.get("colors") or full_product.get("colors") or []
                item_colors = [str(c).lower().strip() for c in (raw_colors if isinstance(raw_colors, list) else [raw_colors])]
                if any(str(color).lower().strip() in item_colors for color in req.excluded_colors):
                    continue
                
                raw_tags = meta.get("aesthetic_tags") or full_product.get("aesthetic_tags") or []
                item_tags = [str(t).lower().strip() for t in (raw_tags if isinstance(raw_tags, list) else [raw_tags])]
                if any(str(tag).lower().strip() in item_tags for tag in req.excluded_tags):
                    continue

                # --- 1. LEXICAL KEYWORD BOOST (Fixes Cargo Pants Ignored) ---
                original_score = match_score
                item_keywords = [k.lower() for k in full_product.get("keywords", [])]
                for target in target_items:
                    target_lower = target.lower()
                    if target_lower in item_keywords or any(target_lower in k or k in target_lower for k in item_keywords):
                        match_score *= 1.5 
                        break # Only boost once per item, even if multiple targets match
                #print(item_keywords,target_items)
                #if match_score != original_score:
                m_name = meta.get("name") or full_product.get("name", "Unknown Item")
               # print(f"  [KEYWORD BOOST] {m_name} (ID: {match.id}) | Score: {original_score:.4f} -> {match_score:.4f}")

                # --- 2. CONTEXTUAL VIBE GATE (Fixes Office vs Ethnic Formal) ---
                is_office_request = "office" in raw_query or "internship" in raw_query or "interview" in raw_query
                is_ethnic_request = "kurta" in raw_query or "traditional" in raw_query or "wedding" in raw_query or "farewell" in raw_query
                req_occasion = getattr(req, "occasion_category", "") or ""

                if req_occasion.lower() in ["formal", "wedding"]:
                    # Always penalize streetwear if they ask for formal
                    if "streetwear" in item_tags:
                        match_score *= 0.4
                    
                    if is_office_request:
                        if any(tag in ["ethnic", "traditional"] for tag in item_tags):
                            match_score *= 0.5 # Penalize ethnic for office
                        if "formal-business" in [o.lower() for o in full_product.get("occasions", [])]:
                            match_score *= 1.5 # Boost business items
                    
                    elif is_ethnic_request:
                        if "formal-ethnic" in [o.lower() for o in full_product.get("occasions", [])] or "wedding" in [o.lower() for o in full_product.get("occasions", [])]:
                            match_score *= 1.5 # Boost ethnic items

                candidates.append({
                    "id": match.id,
                    "name": full_product.get("name") or meta.get("name"),
                    "category": slot,
                    "price": float(full_product.get("price") or meta.get("price")),
                    "image_url": full_product.get("image_url") or meta.get("image_url"),
                    "score": match_score,
                    "tags": item_tags,
                    "occasions": [str(o).lower() for o in full_product.get("occasions", [])]
                })

            if not candidates:
                fallback_items = [p for p in MockDB.get_products() if p["category"] == pinecone_cat]
                for p in fallback_items:
                    if cls._is_gender_mismatched(req.user_gender, p.get("gender")):
                        continue

                    raw_colors = p.get("colors") or []
                    item_colors = [str(c).lower().strip() for c in raw_colors]
                    if any(str(color).lower().strip() in item_colors for color in req.excluded_colors):
                        continue
                    
                    raw_tags = p.get("aesthetic_tags") or []
                    item_tags = [str(t).lower().strip() for t in raw_tags]
                    if any(str(tag).lower().strip() in item_tags for tag in req.excluded_tags):
                        continue

                    candidates.append({
                        "id": p["id"],
                        "name": p["name"],
                        "category": slot,
                        "price": float(p["price"]),
                        "image_url": p["image_url"],
                        "score": 0.1 + (1.0 / (float(p["price"]) + 1.0)),
                        "tags": item_tags,
                        "occasions": [str(o).lower() for o in p.get("occasions", [])]
                    })
                    
            candidates.sort(key=lambda x: x["score"], reverse=True)
            slot_candidates[slot] = candidates[:4]

        if any(len(slot_candidates[slot]) == 0 for slot in slots):
            return {
                "outfit": [],
                "swap_boxes": {s: [] for s in slots},
                "budget_exceeded": False,
                "local_consent_prompt": "Uh oh, none of our current stock pieces completely align with that style option. Try shifting your tags!"
            }

        max_budget_limit = req.max_budget if req.max_budget is not None else 100000

        best_combo = None
        best_total_score = -1.0
        
        # --- 3. COMBINATORIAL OPTIMIZATION LOOP ---
        for top in slot_candidates["TOP"]:
            for bottom in slot_candidates["BOTTOM"]:
                for footwear in slot_candidates["FOOTWEAR"]:
                    for accessory in slot_candidates["ACCESSORY"]:
                        combo_price = top["price"] + bottom["price"] + footwear["price"] + accessory["price"]
                        
                        if combo_price <= max_budget_limit:
                            base_score = top["score"] + bottom["score"] + footwear["score"] + accessory["score"]
                            
                            # --- 4. HARMONY PENALTY (Prevents Clashing Vibes) ---
                            vibe_clash = 0.0
                            top_is_formal = any(o in ["formal-business", "formal-ethnic", "office"] for o in top["occasions"])
                            bottom_is_street = "streetwear" in bottom["tags"]
                            footwear_is_street = "streetwear" in footwear["tags"]
                            
                            if top_is_formal and (bottom_is_street or footwear_is_street):
                                vibe_clash += 0.8  # Heavy penalty for mixing suit jackets with cargo pants
                                
                            combo_score = base_score - vibe_clash
                            
                            if combo_score > best_total_score:
                                best_total_score = combo_score
                                best_combo = [top, bottom, footwear, accessory]

        budget_exceeded = False
        if best_combo is None:
            budget_exceeded = True
            best_combo = [
                min(slot_candidates["TOP"], key=lambda x: x["price"]),
                min(slot_candidates["BOTTOM"], key=lambda x: x["price"]),
                min(slot_candidates["FOOTWEAR"], key=lambda x: x["price"]),
                min(slot_candidates["ACCESSORY"], key=lambda x: x["price"])
            ]


        # Cleanup internal keys before returning to frontend
        for item in best_combo:
            item.pop("tags", None)
            item.pop("occasions", None)
            
        swap_boxes = {}
        for s in slots:
            clean_swaps = []
            for c in slot_candidates[s]:
                if c["id"] != best_combo[slots.index(s)]["id"]:
                    clean_c = c.copy()
                    clean_c.pop("tags", None)
                    clean_c.pop("occasions", None)
                    clean_swaps.append(clean_c)
            swap_boxes[s] = clean_swaps[:4]

        return {
            "outfit": best_combo,
            "swap_boxes": swap_boxes,
            "budget_exceeded": budget_exceeded
        }

    @classmethod
    def get_slot_alternatives(cls, req: GenieAlternativesRequest) -> List[Dict[str, Any]]:
        index = cls._get_resources()

        slot = req.category_to_refresh or req.slot_category
        active_ids = req.active_combination_ids or req.current_outfit_ids or []
        page = req.page

        if not slot:
            return []

        pinecone_cat = cls.map_frontend_category_to_pinecone(slot)
        front_cat = cls.map_pinecone_category_to_frontend(slot)

        other_total = 0.0
        for p_id in active_ids:
            p = MockDB.get_product(p_id)
            if p:
                other_total += float(p["price"])
        
        remaining_budget = float(req.max_budget) - other_total if req.max_budget else 100000

        target_items = getattr(req, "target_items", [])
        target_str = ", ".join(target_items) if target_items else ""

        search_text = f"Category: {pinecone_cat}. Name: {target_str}. Occasion: {req.occasion_category or ''}. Aesthetics: {', '.join(req.aesthetic_tags)}."
        query_vector = cls._get_embedding(search_text)

        filter_dict = {
            "category": pinecone_cat,
            "price": {"$lte": remaining_budget}
        }
        
        if req.user_gender:
            g_val = str(req.user_gender).strip()
            filter_dict["gender"] = {"$in": [g_val, g_val.lower(), g_val.title(), g_val.upper(), "Unisex"]}

        if req.excluded_colors:
            banned_colors = [str(c).lower().strip() for c in req.excluded_colors]
            filter_dict["colors"] = {"$nin": banned_colors}
            
        if req.excluded_tags:
            banned_tags = [str(t).lower().strip() for t in req.excluded_tags]
            filter_dict["aesthetic_tags"] = {"$nin": banned_tags}

        res = index.query(
            vector=query_vector,
            top_k=30,
            include_metadata=True,
            filter=filter_dict
        )

        candidates = []
        active_set = set(active_ids)
        for match in res.matches:
            if match.id in active_set:
                continue

            full_product = MockDB.get_product(match.id)
            if not full_product:
                continue
                
            if cls._is_gender_mismatched(req.user_gender, full_product.get("gender")):
                continue

            meta = match.metadata
            
            raw_colors = meta.get("colors") or full_product.get("colors") or []
            item_colors = [str(c).lower().strip() for c in (raw_colors if isinstance(raw_colors, list) else [raw_colors])]
            if any(str(color).lower().strip() in item_colors for color in req.excluded_colors):
                continue
                
            raw_tags = meta.get("aesthetic_tags") or full_product.get("aesthetic_tags") or []
            item_tags = [str(t).lower().strip() for t in (raw_tags if isinstance(raw_tags, list) else [raw_tags])]
            if any(str(tag).lower().strip() in item_tags for tag in getattr(req, "excluded_tags", [])):
                continue
            
            # We rely on Pinecone's vector similarity to rank by aesthetics/occasions,
            
            candidates.append({
                "id": match.id,
                "name": full_product.get("name") or match.metadata.get("name"),
                "category": slot,
                "price": float(full_product.get("price") or match.metadata.get("price")),
                "image_url": full_product.get("image_url") or match.metadata.get("image_url"),
                "score": float(match.score)
            })

        # Sort by score descending
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        limit = 4
        offset = page * limit
        paginated_candidates = candidates[offset : offset + limit]

        if not paginated_candidates and candidates:
            paginated_candidates = candidates[:limit]

        return paginated_candidates