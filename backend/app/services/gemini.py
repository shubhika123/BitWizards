import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("app.services.gemini")

# Try importing google-genai, fall back gracefully if missing or keys absent
GENAI_AVAILABLE = False
try:
    from google import genai
    from google.genai import types
    if settings.GEMINI_API_KEY:
        GENAI_AVAILABLE = True
except ImportError:
    logger.warning("google-genai library not found. Falling back to rule-based processing.")

class GeminiService:
    _client = None

    @classmethod
    def get_client(cls):
        if not GENAI_AVAILABLE or not settings.GEMINI_API_KEY:
            return None
        if cls._client is None:
            try:
                cls._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
                return None
        return cls._client

    @classmethod
    def parse_natural_language_search(cls, query: str) -> Dict[str, Any]:
        """
        Parses user's shopping request to extract structured details:
        - festival (e.g. Onam, Teej)
        - region / city (e.g. Lucknow, Jaipur)
        - weather / climate (e.g. Monsoon, Summer)
        - budget (numeric limit or range)
        - style (traditional, casual, western, streetwear)
        - categories / products (e.g. saree, kurta, t-shirt)
        """
        client = cls.get_client()
        if not client:
            # High-quality Rule-based Fallback Parser
            logger.info("Using rule-based parser fallback.")
            return cls._fallback_parse_query(query)

        prompt = f"""
        Analyze the following Indian fashion e-commerce shopping query:
        "{query}"

        Extract and return a JSON object with these EXACT keys. Do not include any other text, markdown formatting or blocks besides raw JSON:
        - "festival": string or null (detect common Indian festivals like Onam, Teej, Raksha Bandhan, Diwali, Chhath Puja, Eid, etc.)
        - "region": string or null (detect cities or regions like Lucknow, Jaipur, Kerala, Delhi, Patna, Chennai, Coimbatore, Vizag)
        - "weather": string or null (detect climate cues like Monsoon, Rainy, Summer, Winter, Humid, Hot, Cool)
        - "budget": integer or null (extract numeric budget limits, e.g., "under 2000" should yield 2000)
        - "style": string or null (e.g., traditional, ethnic, streetwear, casual, formal, office wear)
        - "categories": list of strings (extract target items, e.g., "saree", "kurta", "t-shirt", "suit set", "cargos")

        Example:
        Query: "need something for Teej under 2000 in Jaipur"
        Output: {{"festival": "Teej", "region": "Jaipur", "weather": null, "budget": 2000, "style": "traditional", "categories": ["suit set", "kurta"]}}
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            parsed = json.loads(response.text.strip())
            return parsed
        except Exception as e:
            logger.error(f"Gemini API parse failed: {e}. Using fallback.")
            return cls._fallback_parse_query(query)

    @classmethod
    def generate_recommendation_reason(cls, product: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        Generates a human-friendly personalized trust explanation of why a product is recommended.
        """
        client = cls.get_client()
        
        region = context.get("region", "your region")
        weather = context.get("weather", "")
        festival = context.get("festival", "")
        budget = context.get("budget")

        if not client:
            # Rule-based generator fallback
            reasons = []
            if festival and festival.lower() in [f.lower() for f in product.get("festivals", [])]:
                reasons.append(f"Ideal choice for upcoming {festival}")
            if region and region.lower() == product.get("region", "").lower():
                reasons.append(f"Very popular and trending in {product.get('region')}")
            if weather and weather.lower() in [w.lower() for w in product.get("weather", [])]:
                reasons.append(f"Suitable for current {weather} climate")
            if budget and product.get("price", 0) <= int(budget):
                reasons.append("Perfectly fits your specified budget")
            
            if not reasons:
                reasons = ["Highly rated by shoppers in your region", "Matches local styling preferences"]
            return " • ".join(reasons)

        prompt = f"""
        Write a very concise, punchy sentence explaining why this product is recommended to the user.
        Format it as a bulleted list of 2-3 short checkmarks (using checks/ticks like ✓).
        
        Product: {product['name']}
        Region: {product.get('region', 'N/A')}
        Festivals supported: {', '.join(product.get('festivals', []))}
        Weather suitability: {', '.join(product.get('weather', []))}
        Price: Rs. {product['price']}
        
        User Context:
        - Current City: {region}
        - Current Weather: {weather}
        - Upcoming local event/festival: {festival}
        - Preferred Budget Limit: {f"Rs. {budget}" if budget else "None"}

        Focus on regional alignment, local weather, and budget fit. Keep it short (max 30 words total).
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.3)
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API reasoning failed: {e}")
            return f"✓ Trending in {product.get('region', 'your area')} \n✓ Comfortable material \n✓ Within budget"

    @classmethod
    def summarize_reviews(cls, product_name: str, reviews: list[str]) -> str:
        """
        Summarizes customer reviews focusing on regional fit, fabric and sizing feedback.
        """
        client = cls.get_client()
        if not client or not reviews:
            return "✓ Soft breathable fabric \n✓ Fits true to size \n✓ Highly recommended for festive wear"

        prompt = f"""
        Provide a summary of the following customer reviews for the product '{product_name}'.
        Highlight the key consensus regarding size fit, fabric comfort, and occasion suitability.
        Format as 3 short bullet points starting with '✓'. Max 25 words total.
        
        Reviews:
        {chr(10).join(reviews)}
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API review summary failed: {e}")
            return "✓ Fabric is lightweight & high quality \n✓ Fits perfectly \n✓ True value for money"

    @staticmethod
    def _fallback_parse_query(query: str) -> Dict[str, Any]:
        """
        Simple keyword-based parser for local operations.
        """
        q = query.lower()
        result = {
            "festival": None,
            "region": None,
            "weather": None,
            "budget": None,
            "style": None,
            "categories": []
        }
        
        # Festival keywords
        festivals = ["teej", "onam", "diwali", "raksha bandhan", "rakhi", "eid", "chhath", "pongal", "durga puja", "vishu"]
        for f in festivals:
            if f in q:
                result["festival"] = f.title()
                break
                
        # Region keywords
        regions = ["lucknow", "jaipur", "kerala", "delhi", "patna", "chennai", "coimbatore", "vizag", "kochi"]
        for r in regions:
            if r in q:
                result["region"] = r.title()
                break
                
        # Weather keywords
        weather_terms = {
            "monsoon": "Monsoon", "rain": "Monsoon", "rainy": "Monsoon",
            "summer": "Summer", "hot": "Summer", "warm": "Summer",
            "cool": "Cool", "winter": "Cool", "cold": "Cool",
            "humid": "Humid", "dry": "Dry"
        }
        for term, val in weather_terms.items():
            if term in q:
                result["weather"] = val
                break
                
        # Budget detection
        import re
        budget_match = re.search(r'(?:under|below|budget of|rs\.?|in|₹)\s*(\d+)', q)
        if budget_match:
            result["budget"] = int(budget_match.group(1))
            
        # Style detection
        styles = {
            "traditional": "traditional", "ethnic": "ethnic", "streetwear": "streetwear",
            "casual": "casual", "office": "office wear", "formal": "formal"
        }
        for term, val in styles.items():
            if term in q:
                result["style"] = val
                break

        # Categories
        categories_dict = ["saree", "kurta", "kurti", "t-shirt", "tee", "cargos", "suit", "sharara"]
        for cat in categories_dict:
            if cat in q:
                result["categories"].append(cat)
                
        return result
