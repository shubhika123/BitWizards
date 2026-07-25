import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.database import MockDB
from app.services.gemini import GeminiService

class TestMyntraBharatAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_healthcheck(self):
        """Test healthcheck endpoint"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["service"], "Myntra Bharat Layer Backend")

    def test_feed_lucknow_summer(self):
        """Test feed sorting for Lucknow in Summer context"""
        response = self.client.post("/api/feed", json={
            "region": "Lucknow",
            "weather": "Summer",
            "festival": "Teej"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        products = data["products"]
        self.assertTrue(len(products) > 0)
        # First product should ideally be Lucknow + Teej / cotton (prod_1 or prod_2)
        top_product = products[0]
        self.assertTrue("Chikankari" in top_product["name"] or "Bandhani" in top_product["name"])
        self.assertTrue(len(data["regional_trends"]) > 0)

    def test_feed_delhi_monsoon(self):
        """Test feed sorting for Delhi in Monsoon context"""
        response = self.client.post("/api/feed", json={
            "region": "Delhi",
            "weather": "Monsoon",
            "style": "Streetwear"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        products = data["products"]
        self.assertTrue(len(products) > 0)
        top_product = products[0]
        self.assertTrue("Streetwear" in top_product["name"] or "Cargo" in top_product["name"])

    def test_fallback_search_parser(self):
        """Test the backup rule-based query parser"""
        query = "need a chikankari kurta under 1500 for Teej in Lucknow"
        parsed = GeminiService._fallback_parse_query(query)
        
        self.assertEqual(parsed["festival"], "Teej")
        self.assertEqual(parsed["region"], "Lucknow")
        self.assertEqual(parsed["budget"], 1500)
        self.assertIn("kurta", parsed["categories"])

    def test_negotiate_accept(self):
        """Test bargaining acceptance when bid is close to original price"""
        response = self.client.post("/api/bazaar/negotiate", json={
            "boutique_id": "boutique_1",
            "product_id": "prod_1",
            "proposed_price": 1200,  # 1200 / 1299 = 92.3% (should accept)
            "original_price": 1299
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "accepted")
        self.assertEqual(data["final_price"], 1200)

    def test_negotiate_counter(self):
        """Test bargaining counter-offer when bid is lower but reasonable"""
        response = self.client.post("/api/bazaar/negotiate", json={
            "boutique_id": "boutique_1",
            "product_id": "prod_1",
            "proposed_price": 1050,  # 1050 / 1299 = 80.8% (should counter-offer)
            "original_price": 1299
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "counter-offered")
        self.assertTrue(data["final_price"] < 1299)
        self.assertTrue(data["final_price"] > 1050)

    def test_second_round_never_raises_seller_offer(self):
        """A later seller counter must not exceed the prior seller offer."""
        response = self.client.post("/api/bazaar/negotiate", json={
            "boutique_id": "boutique_1",
            "product_id": "prod_1",
            "proposed_price": 1050,
            "original_price": 1200,
            "round_number": 2,
            "previous_seller_offer": 1100,
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertLessEqual(data["final_price"], 1100)

    def test_social_vote(self):
        """Test voting toggles on Outfit Circle items"""
        # Toggle vote on
        response = self.client.post("/api/social/vote", json={
            "group_id": "group_1",
            "item_id": "item_1",
            "user": "Kuhu"
        })
        self.assertEqual(response.status_code, 200)
        
        # Test fetching updated groups
        response = self.client.get("/api/social/groups")
        self.assertEqual(response.status_code, 200)
        groups = response.json()
        group1 = next(g for g in groups if g["id"] == "group_1")
        item1 = next(i for i in group1["items"] if i["id"] == "item_1")
        
        # Kuhn voted on setup, so toggled vote should remove her or toggle back
        # Since setUp had Kuhn in voted_by, this toggle should remove Kuhn and reduce votes
        self.assertNotIn("Kuhu", item1["voted_by"])

if __name__ == "__main__":
    unittest.main()
