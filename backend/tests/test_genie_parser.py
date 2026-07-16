import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.gemini import GeminiService
from app.config import settings

class TestGenieParser(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.has_api_key = bool(settings.GROQ_API_KEY)

    def test_live_or_fallback_english_clear(self):
        query = "minimalist smart-casual outfit for office under 3000"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        self.assertEqual(parsed["query"], query)
        
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "English")
            self.assertEqual(parsed["occasion_category"], "Work")
            self.assertEqual(parsed["max_budget"], 3000)
            self.assertEqual(parsed["confidence"], "high")
        else:
            self.assertEqual(parsed["detected_language"], "Unknown")
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_english_vague(self):
        query = "asdfasdf some clothes for stuff"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_english_negation(self):
        query = "not black, casual hang out with friends, budget 4000"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "English")
            self.assertEqual(parsed["occasion_category"], "Casual")
            self.assertEqual(parsed["max_budget"], 4000)
            self.assertIn("black", parsed["excluded_colors"])
            self.assertIsNone(parsed["primary_color"])
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hindi_wedding(self):
        query = "शादी के लिए अच्छा सा कुर्ता सेट चाहिए, बजट ५०००"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hindi")
            self.assertEqual(parsed["occasion_category"], "Wedding")
            self.assertEqual(parsed["max_budget"], 5000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hindi_budget(self):
        query = "३००० के अंदर सुंदर साड़ी दिखाओ"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hindi")
            self.assertEqual(parsed["max_budget"], 3000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hindi_negation(self):
        query = "पीला रंग नहीं, हल्दी फंक्शन के लिए कपड़े, बजट २०००"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hindi")
            self.assertEqual(parsed["max_budget"], 2000)
            self.assertTrue(len(parsed["excluded_colors"]) > 0)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hinglish_wedding_local(self):
        query = "Bhai ki shaadi ke liye ek accha black sherwani near me"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hinglish")
            self.assertEqual(parsed["occasion_category"], "Wedding")
            self.assertEqual(parsed["primary_color"], "black")
            self.assertTrue(parsed["is_local_preferred"])
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hinglish_casual(self):
        query = "daily wear ke liye simple jeans and tshirt, max 1500"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hinglish")
            self.assertEqual(parsed["occasion_category"], "Casual")
            self.assertEqual(parsed["max_budget"], 1500)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_hinglish_negation(self):
        query = "haldi ke liye yellow kurta set but strictly no red, price under 3k"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Hinglish")
            self.assertEqual(parsed["primary_color"], "yellow")
            self.assertIn("red", parsed["excluded_colors"])
            self.assertEqual(parsed["max_budget"], 3000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bengali_wedding(self):
        query = "বিয়্যের জন্য একটা সুন্দর শাড়ি চাই, বাজেট ৫০০০ টাকা"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bengali")
            self.assertEqual(parsed["occasion_category"], "Wedding")
            self.assertEqual(parsed["max_budget"], 5000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bengali_party(self):
        query = "পার্টির জন্য ওয়েস্টার্ন ড্রেস, দাম ২০০০"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bengali")
            self.assertEqual(parsed["occasion_category"], "Party")
            self.assertEqual(parsed["max_budget"], 2000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bengali_negation(self):
        query = "কালো রঙের নয়, ক্যাজুয়াল পরার জন্য পোশাক"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bengali")
            self.assertIn("black", parsed["excluded_colors"])
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_tamil_wedding(self):
        query = "திருமணத்திற்கு ஒரு அழகான பட்டு புடவை வேண்டும்"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Tamil")
            self.assertEqual(parsed["occasion_category"], "Wedding")
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_tamil_casual(self):
        query = "தினசரி அணிய ஜீன்ஸ் மற்றும் டி-ஷர்ட், பட்ஜெட் 1500"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Tamil")
            self.assertEqual(parsed["occasion_category"], "Casual")
            self.assertEqual(parsed["max_budget"], 1500)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_tamil_negation(self):
        query = "நீல நிறம் வேண்டாம், மஞ்சள் நிறத்தில் விழா உடை வேண்டும்"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Tamil")
            self.assertEqual(parsed["primary_color"], "yellow")
            self.assertIn("blue", parsed["excluded_colors"])
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bhojpuri_wedding(self):
        query = "शादी खातिर एगो बढ़िया शेरवानी देखा द, बजट ५०००"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bhojpuri")
            self.assertEqual(parsed["occasion_category"], "Wedding")
            self.assertEqual(parsed["max_budget"], 5000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bhojpuri_casual(self):
        query = "घर पहिरे खातिर एगो बढ़िया कुर्ती, दाम २००० से कम"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bhojpuri")
            self.assertEqual(parsed["occasion_category"], "Casual")
            self.assertEqual(parsed["max_budget"], 2000)
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_live_or_fallback_bhojpuri_negation(self):
        query = "काला रंग ना होखे, भाई के फंक्शन खातिर बढ़िया धोती कुर्ता"
        parsed = GeminiService.parse_genie_query(query)
        
        self.assertIn("query", parsed)
        if self.has_api_key and parsed["confidence"] != "low":
            self.assertEqual(parsed["detected_language"], "Bhojpuri")
            self.assertIn("black", parsed["excluded_colors"])
        else:
            self.assertEqual(parsed["confidence"], "low")

    def test_api_parse_endpoint(self):
        response = self.client.post("/api/genie/parse", json={"query": "minimalist casual look"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("query", data)
        self.assertIn("detected_language", data)
        self.assertIn("confidence", data)

if __name__ == "__main__":
    unittest.main()
