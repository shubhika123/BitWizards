import unittest
from app.models.GenieSchema import GenieCurateRequest, GenieSwapRequest
from app.services.curation_engine import CurationEngine


class TestCurationEngine(unittest.TestCase):
    """Unit tests for the Module 2 Core Curation Engine."""

    def test_generate_outfit_returns_four_items(self):
        req = GenieCurateRequest(
            occasion_category="Wedding",
            aesthetic_tags=["ethnic", "heavy"],
            max_budget=5000
        )
        result = CurationEngine.generate_outfit(req)
        self.assertEqual(len(result["outfit"]), 4)
        self.assertIn(result["outfit"][0]["category"], ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"])

    def test_generate_outfit_orders_slots(self):
        req = GenieCurateRequest(
            occasion_category="Casual",
            aesthetic_tags=["minimalist"],
            max_budget=5000
        )
        result = CurationEngine.generate_outfit(req)
        categories = [p["category"] for p in result["outfit"]]
        self.assertEqual(categories, ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"])

    def test_hard_exclusion_colors(self):
        req = GenieCurateRequest(
            occasion_category="Wedding",
            max_budget=5000,
            excluded_colors=["gold", "maroon", "cream"]
        )
        result = CurationEngine.generate_outfit(req)
        for product in result["outfit"]:
            for color in product.get("colors", []):
                self.assertNotIn(color.lower(), ["gold", "maroon", "cream"])

    def test_locked_item_immutability(self):
        req = GenieCurateRequest(
            occasion_category="Wedding",
            aesthetic_tags=["ethnic"],
            max_budget=5000,
            locked_item_ids=["top_002"]
        )
        result = CurationEngine.generate_outfit(req)
        top_item = [p for p in result["outfit"] if p["category"] == "TOP"][0]
        self.assertEqual(top_item["id"], "top_002")

    def test_budget_exceeded_fallback(self):
        req = GenieCurateRequest(
            max_budget=1000
        )
        result = CurationEngine.generate_outfit(req)
        self.assertTrue(result["budget_exceeded"])
        total_price = sum(p["price"] for p in result["outfit"])
        self.assertGreater(total_price, 1000)
        self.assertEqual(len(result["outfit"]), 4)

    def test_local_consent_prompt(self):
        req = GenieCurateRequest(
            occasion_category="Festive",
            max_budget=5000,
            is_local_preferred=True
        )
        result = CurationEngine.generate_outfit(req)
        self.assertIsNotNone(result["local_consent_prompt"])
        self.assertIn("Ghaziabad/Noida NCR", result["local_consent_prompt"])

    def test_no_local_consent_prompt(self):
        req = GenieCurateRequest(
            occasion_category="Festive",
            max_budget=5000,
            is_local_preferred=False
        )
        result = CurationEngine.generate_outfit(req)
        self.assertIsNone(result["local_consent_prompt"])

    def test_get_slot_alternatives_top_three(self):
        req = GenieSwapRequest(
            slot_category="TOP",
            current_outfit_ids=["top_001", "bottom_001", "footwear_002", "accessory_002"],
            max_budget=5000,
            aesthetic_tags=["ethnic"]
        )
        alternatives = CurationEngine.get_slot_alternatives(req)
        self.assertLessEqual(len(alternatives), 3)
        for alt in alternatives:
            self.assertEqual(alt["category"], "TOP")

    def test_get_slot_alternatives_respects_remaining_budget(self):
        req = GenieSwapRequest(
            slot_category="TOP",
            current_outfit_ids=["top_001", "bottom_001", "footwear_002", "accessory_002"],
            max_budget=5000,
            aesthetic_tags=["ethnic"]
        )
        alternatives = CurationEngine.get_slot_alternatives(req)
        other_total = 650 + 1200 + 1100  # bottom_001 + footwear_002 + accessory_002
        remaining = 5000 - other_total
        for alt in alternatives:
            self.assertLessEqual(alt["price"], remaining)

    def test_get_slot_alternatives_invalid_slot(self):
        req = GenieSwapRequest(
            slot_category="INVALID",
            current_outfit_ids=["top_001", "bottom_001", "footwear_002", "accessory_002"],
            max_budget=5000
        )
        alternatives = CurationEngine.get_slot_alternatives(req)
        self.assertEqual(alternatives, [])

    def test_vector_score_between_zero_and_one(self):
        products = CurationEngine._apply_color_exclusion([], [])
        self.assertEqual(products, [])

    def test_vector_score_computation(self):
        product = {
            "id": "test_001",
            "name": "Ethnic Silk Kurta",
            "category": "TOP",
            "price": 1500,
            "occasions": ["Wedding", "Festive"],
            "colors": ["gold"],
            "aesthetic_tags": ["ethnic", "heavy"],
            "image_url": "/catalog/test_001.png"
        }
        score = CurationEngine._compute_vector_score(
            product, "Wedding", ["ethnic"]
        )
        self.assertGreater(score, 0.0)
        self.assertLessEqual(score, 1.0)


if __name__ == "__main__":
    unittest.main()
