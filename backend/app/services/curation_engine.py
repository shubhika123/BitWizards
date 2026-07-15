"""
Module 2: Core AI Curation & Recommendation Engine

This module simulates a production-grade vector-similarity recommendation layer
(pgvector / HNSW) using an in-memory token-space overlap engine. It receives a
structured intent payload from the NLP Translation Gateway (Module 1), scores
the 50-item MockDB catalog, applies hard negation exclusions, respects item
pinning constraints, and computes an optimized 4-piece outfit via a greedy
constraint traversal loop.
"""

import re
from typing import List, Dict, Any, Optional
from app.models.GenieSchema import GenieCurateRequest, GenieSwapRequest
from app.services.database import MockDB


class CurationEngine:
    """
    Production-abstracted curation engine.

    Implements:
      - local text-token vector similarity scoring
      - hard negation exclusion filtering
      - pinning immutability enforcement
      - greedy budget-constrained outfit optimization
      - per-slot alternative generation for the swap drawer
    """

    VALID_SLOTS = {"TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"}
    SLOT_ORDER = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"]

    @staticmethod
    def _normalize_tokens(text: Optional[str]) -> List[str]:
        """
        Lowercase, strip punctuation, and split text into clean whitespace tokens.
        """
        if not text:
            return []
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [token for token in cleaned.split() if token]

    @classmethod
    def _tokenize_list(cls, items: List[str]) -> List[str]:
        """
        Flatten a list of strings into normalized tokens.
        """
        tokens: List[str] = []
        for item in items:
            tokens.extend(cls._normalize_tokens(item))
        return tokens

    @classmethod
    def _compute_vector_score(
        cls,
        product: Dict[str, Any],
        occasion_category: Optional[str],
        aesthetic_tags: List[str]
    ) -> float:
        """
        Compute a token-space overlap score (Jaccard index) between the user's
        intent vector (occasion + aesthetics) and the product corpus
        (name + occasions + aesthetic_tags).

        Returns a float between 0.0 and 1.0.
        """
        product_corpus = (
            cls._normalize_tokens(product.get("name", ""))
            + cls._tokenize_list(product.get("occasions", []))
            + cls._tokenize_list(product.get("aesthetic_tags", []))
        )

        user_corpus = (
            cls._normalize_tokens(occasion_category)
            + cls._tokenize_list(aesthetic_tags)
        )

        if not user_corpus or not product_corpus:
            return 0.0

        product_set = set(product_corpus)
        user_set = set(user_corpus)

        intersection = product_set & user_set
        union = product_set | user_set

        if not union:
            return 0.0

        return len(intersection) / len(union)

    @classmethod
    def _apply_color_exclusion(
        cls,
        products: List[Dict[str, Any]],
        excluded_colors: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Strip any item whose color list contains any of the excluded colors.
        """
        if not excluded_colors:
            return products

        excluded_set = {color.lower() for color in excluded_colors}
        return [
            product for product in products
            if not any(color.lower() in excluded_set for color in product.get("colors", []))
        ]

    @classmethod
    def _apply_primary_color_filter(
        cls,
        products: List[Dict[str, Any]],
        primary_color: Optional[str]
    ) -> List[Dict[str, Any]]:
        """
        Optional soft boost: if a primary color is requested, keep items that
        explicitly contain that color. If no items match, return the original
        list so the engine can still produce a complete outfit.
        """
        if not primary_color:
            return products

        primary = primary_color.lower()
        color_matches = [
            product for product in products
            if any(color.lower() == primary for color in product.get("colors", []))
        ]

        return color_matches if color_matches else products

    @classmethod
    def _build_buckets(
        cls,
        products: List[Dict[str, Any]],
        locked_item_ids: List[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group products into the four slot buckets. If a locked item ID belongs to
        a bucket, that bucket is reduced to only the pinned item (immutability).
        """
        locked_set = set(locked_item_ids)
        buckets: Dict[str, List[Dict[str, Any]]] = {
            "TOP": [],
            "BOTTOM": [],
            "FOOTWEAR": [],
            "ACCESSORY": []
        }

        for product in products:
            category = product.get("category")
            if category not in buckets:
                continue
            buckets[category].append(product)

        # Enforce pinning immutability per bucket
        for slot in cls.SLOT_ORDER:
            bucket = buckets[slot]
            locked_in_bucket = [p for p in bucket if p["id"] in locked_set]
            if locked_in_bucket:
                buckets[slot] = locked_in_bucket

        return buckets

    @classmethod
    def _sort_buckets_by_vector_score(
        cls,
        buckets: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Sort every bucket by vector_score descending so the greedy traversal
        evaluates the highest-similarity items first.
        """
        return {
            slot: sorted(bucket, key=lambda p: p.get("vector_score", 0.0), reverse=True)
            for slot, bucket in buckets.items()
        }

    @classmethod
    def generate_outfit(cls, req: GenieCurateRequest) -> Dict[str, Any]:
        """
        Generate a complete 4-piece outfit using vector similarity, hard negation
        exclusions, pinning immutability, and greedy budget optimization.

        Returns:
            {
                "outfit": [TOP, BOTTOM, FOOTWEAR, ACCESSORY]  # 4 product dicts
                "budget_exceeded": bool,
                "local_consent_prompt": Optional[str]
            }
        """
        # -----------------------------------------------------------------
        # Step 3.1: Load & Score
        # -----------------------------------------------------------------
        all_products = MockDB.get_genie_products()

        for product in all_products:
            product["vector_score"] = cls._compute_vector_score(
                product,
                req.occasion_category,
                req.aesthetic_tags
            )

        # -----------------------------------------------------------------
        # Step 3.2: Hard Exclusions
        # -----------------------------------------------------------------
        filtered = cls._apply_color_exclusion(all_products, req.excluded_colors)

        # -----------------------------------------------------------------
        # Optional primary-color soft filter
        # -----------------------------------------------------------------
        filtered = cls._apply_primary_color_filter(filtered, req.primary_color)

        # -----------------------------------------------------------------
        # Step 3.3: Pinning Immutability
        # -----------------------------------------------------------------
        buckets = cls._build_buckets(filtered, req.locked_item_ids)

        # -----------------------------------------------------------------
        # Defensive check: ensure every bucket has at least one candidate
        # -----------------------------------------------------------------
        for slot in cls.SLOT_ORDER:
            if not buckets[slot]:
                # Fallback: fill from the full unfiltered catalog so the UI
                # never receives an incomplete outfit.
                fallback_candidates = [
                    p for p in all_products if p.get("category") == slot
                ]
                buckets[slot] = fallback_candidates or [{
                    "id": f"fallback_{slot.lower()}",
                    "name": f"Fallback {slot.title()}",
                    "category": slot,
                    "price": 0,
                    "occasions": [],
                    "colors": [],
                    "aesthetic_tags": [],
                    "image_url": f"/catalog/fallback_{slot.lower()}.png",
                    "vector_score": 0.0
                }]

        # -----------------------------------------------------------------
        # Step 3.4: Greedy Combination Optimization
        # -----------------------------------------------------------------
        buckets = cls._sort_buckets_by_vector_score(buckets)

        budget = req.max_budget if req.max_budget is not None else 5000
        best_combo: Optional[List[Dict[str, Any]]] = None
        best_total_score = -1.0

        for top in buckets["TOP"]:
            for bottom in buckets["BOTTOM"]:
                for footwear in buckets["FOOTWEAR"]:
                    for accessory in buckets["ACCESSORY"]:
                        total_price = (
                            top["price"] + bottom["price"] +
                            footwear["price"] + accessory["price"]
                        )
                        if total_price <= budget:
                            total_score = (
                                top.get("vector_score", 0.0)
                                + bottom.get("vector_score", 0.0)
                                + footwear.get("vector_score", 0.0)
                                + accessory.get("vector_score", 0.0)
                            )
                            if total_score > best_total_score:
                                best_total_score = total_score
                                best_combo = [top, bottom, footwear, accessory]

        budget_exceeded = False

        # -----------------------------------------------------------------
        # Defensive Fallback Rule: if budget is too tight, break constraint and
        # return the cheapest possible 4-piece combo to prevent UI crashes.
        # -----------------------------------------------------------------
        if best_combo is None:
            budget_exceeded = True
            cheapest_combo = [
                min(buckets[slot], key=lambda p: p["price"])
                for slot in cls.SLOT_ORDER
            ]
            best_combo = cheapest_combo

        # -----------------------------------------------------------------
        # Step 3.5: Local Prompt Intercept
        # -----------------------------------------------------------------
        local_consent_prompt = None
        if req.is_local_preferred:
            local_consent_prompt = (
                "Genie wishes to look up local boutique inventory near "
                "Ghaziabad/Noida NCR. Allow location access?"
            )

        return {
            "outfit": best_combo,
            "budget_exceeded": budget_exceeded,
            "local_consent_prompt": local_consent_prompt
        }

    @classmethod
    def get_slot_alternatives(cls, req: GenieSwapRequest) -> List[Dict[str, Any]]:
        """
        Generate exactly 3 context-aware alternatives for a single canvas slot
        while keeping the total outfit price within the remaining budget pool.

        Returns:
            A flat list of up to 3 product dictionaries ordered by vector score.
        """
        # -----------------------------------------------------------------
        # Validate slot category
        # -----------------------------------------------------------------
        slot = req.slot_category.upper()
        if slot not in cls.VALID_SLOTS:
            return []

        # -----------------------------------------------------------------
        # Look up the other 3 items on the canvas
        # -----------------------------------------------------------------
        current_items: List[Dict[str, Any]] = []
        for product_id in req.current_outfit_ids:
            product = MockDB.get_genie_product(product_id)
            if product:
                current_items.append(product)

        other_items = [p for p in current_items if p.get("category") != slot]
        other_total = sum(p.get("price", 0) for p in other_items)
        remaining_budget = req.max_budget - other_total

        # -----------------------------------------------------------------
        # Load candidates for this slot and score them
        # -----------------------------------------------------------------
        all_products = MockDB.get_genie_products()
        candidates = [
            p for p in all_products
            if p.get("category") == slot
        ]

        for candidate in candidates:
            candidate["vector_score"] = cls._compute_vector_score(
                candidate,
                None,  # Swap context is slot-specific; aesthetic tags drive similarity
                req.aesthetic_tags
            )

        # -----------------------------------------------------------------
        # Apply hard exclusions and price constraint
        # -----------------------------------------------------------------
        candidates = cls._apply_color_exclusion(candidates, req.excluded_colors)
        candidates = [p for p in candidates if p.get("price", 0) <= remaining_budget]

        # -----------------------------------------------------------------
        # Return the top 3 highest-scoring alternatives
        # -----------------------------------------------------------------
        candidates.sort(key=lambda p: p.get("vector_score", 0.0), reverse=True)
        return candidates[:3]
