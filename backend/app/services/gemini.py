import json
import logging
import re
import requests
from typing import Dict, Any, Optional, List
from pydantic import ValidationError
from app.config import settings
from app.models.GenieSchema import NLPParseResponse

logger = logging.getLogger("app.services.gemini")

GENIE_PARSE_PROMPT = """
You are a multilingual fashion query parser for an Indian e-commerce platform.
You must understand queries in: English, Hindi, Hinglish (Hindi-English code-mixed),
Bengali, Tamil, and Bhojpuri — in native script or transliterated form.

Extract structured attributes as JSON. Follow these rules strictly:

1. detected_language: identify the actual language/script used. Must be one of:
   "English", "Hindi", "Hinglish", "Bengali", "Tamil", "Bhojpuri", "Unknown".
   Use "Unknown" if you cannot confidently identify it — do not guess.

2. occasion_raw: capture the user's own described occasion/context in English translation,
   even if unusual (e.g. "grandmother's 80th birthday puja", "college farewell").

3. occasion_category: map occasion_raw to the closest fit from this list:
   ["Casual", "Formal", "Wedding", "Party", "Festive", "Date", "Work", "Religious", "Other"]
   Use "Other" if nothing fits well. Do NOT force an incorrect match.

4. primary_color / excluded_colors: extract explicitly mentioned colors.
   CRITICAL: if a color is negated ("not red", "no red please", "avoid black"),
   put it in excluded_colors, NEVER in primary_color.

5. aesthetic_tags / excluded_tags: extract style descriptors (e.g. minimalist, streetwear,
   smart-casual, ethnic, boho, formal-chic). Apply the same negation rule as colors —
   negated style terms go into excluded_tags.

6. max_budget: extract numeric budget if mentioned (assume INR unless stated otherwise).
   Return null if not mentioned — do not guess a default.

7. is_local_preferred: true only if the user expresses preference for local/nearby/
   physical/boutique shopping (e.g. "nearby store", "local shop", "not online").
   Default false if not mentioned.

8. confidence: rate your own confidence as "high", "medium", or "low" based on how
   clear and complete the query is. Vague, contradictory, or very short queries = "low".

9. ambiguous_fields: list field names you were not confident about (e.g. ["occasion_category", "primary_color"]).

Return ONLY valid JSON matching this exact structure, no markdown, no explanation:
{
  "detected_language": "",
  "occasion_raw": "",
  "occasion_category": null,
  "primary_color": null,
  "excluded_colors": [],
  "aesthetic_tags": [],
  "excluded_tags": [],
  "max_budget": null,
  "is_local_preferred": false,
  "confidence": "",
  "ambiguous_fields": []
}

---
Examples:

Query: "outfit for my grandmother's 80th birthday puja, budget 4000"
Output: {"detected_language": "English", "occasion_raw": "grandmother's 80th birthday puja", "occasion_category": "Religious", "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": 4000, "is_local_preferred": false, "confidence": "medium", "ambiguous_fields": ["occasion_category"]}

Query: "not red, nothing too formal, casual hangout with friends"
Output: {"detected_language": "English", "occasion_raw": "casual hangout with friends", "occasion_category": "Casual", "primary_color": null, "excluded_colors": ["red"], "aesthetic_tags": ["casual"], "excluded_tags": ["formal"], "max_budget": null, "is_local_preferred": false, "confidence": "high", "ambiguous_fields": []}

Query: "শাড়ি চাই বিয়ের জন্য, বাজেট ৫০০০ টাকা" (Bengali: "want a saree for wedding, budget 5000 rupees")
Output: {"detected_language": "Bengali", "occasion_raw": "wedding", "occasion_category": "Wedding", "primary_color": null, "excluded_colors": [], "aesthetic_tags": ["saree", "traditional"], "excluded_tags": [], "max_budget": 5000, "is_local_preferred": false, "confidence": "high", "ambiguous_fields": []}

Query: "திருமணத்திற்கு ஒரு அழகான உடை வேண்டும், நீல நிறம்" (Tamil: "want a beautiful outfit for wedding, blue color")
Output: {"detected_language": "Tamil", "occasion_raw": "wedding", "occasion_category": "Wedding", "primary_color": "blue", "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": null, "is_local_preferred": false, "confidence": "high", "ambiguous_fields": []}

Query: "Mujhe ek shaadi ke liye outfit chahiye khatir 2000 rupees, local dukan se"
Output: {"detected_language": "Hinglish", "occasion_raw": "wedding", "occasion_category": "Wedding", "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": 2000, "is_local_preferred": true, "confidence": "high", "ambiguous_fields": []}

Query: "shaadi khatir ek accha sa outfit chahiye, battalu na ho"
Output: {"detected_language": "Bhojpuri", "occasion_raw": "wedding", "occasion_category": "Wedding", "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": ["battalu"], "max_budget": null, "is_local_preferred": false, "confidence": "medium", "ambiguous_fields": ["excluded_tags"]}

Query: "asdkfjaslkdfj outfit for the thing you know"
Output: {"detected_language": "English", "occasion_raw": "unclear", "occasion_category": null, "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": null, "is_local_preferred": false, "confidence": "low", "ambiguous_fields": ["occasion_category", "occasion_raw"]}

Now parse this query:
"{user_query}"
"""

class GeminiService:
    @classmethod
    def call_groq(cls, prompt: str, temperature: float = 0.2, json_mode: bool = False) -> str:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured.")
        
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Try llama-3.3-70b-versatile first, then fallback models if needed
        models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"]
        
        last_err = None
        for model in models:
            payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}
                
            try:
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.warning(f"Groq API returned status {response.status_code} for model {model}: {response.text}")
                    last_err = Exception(f"Status {response.status_code}: {response.text}")
            except Exception as e:
                logger.warning(f"Groq request failed for model {model}: {e}")
                last_err = e
        
        if last_err:
            raise last_err
        raise Exception("Failed to call Groq API with any models")

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
        if not settings.GROQ_API_KEY:
            # High-quality Rule-based Fallback Parser
            logger.info("Using rule-based parser fallback (Groq key missing).")
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
            res_text = cls.call_groq(prompt, temperature=0.1, json_mode=True)
            parsed = json.loads(res_text)
            return parsed
        except Exception as e:
            logger.error(f"Groq API parse failed: {e}. Using fallback.")
            return cls._fallback_parse_query(query)

    @classmethod
    def parse_genie_query(cls, query: str) -> Dict[str, Any]:
        """
        Parses raw Hinglish/Regional/English text to extract structured fields according to the new schema.
        """
        if not settings.GROQ_API_KEY:
            logger.info("Using rule-based fallback for Genie query parsing (Groq key missing).")
            return cls._fallback_parse_genie_query(query)

        prompt = GENIE_PARSE_PROMPT.replace("{user_query}", query)
        try:
            res_text = cls.call_groq(prompt, temperature=0.2, json_mode=True)
            # Clean up markdown block fences if returned
            if res_text.startswith("```"):
                res_text = re.sub(r"^```(?:json)?\n|```$", "", res_text, flags=re.MULTILINE).strip()
            # Fix duplicate closing braces if any
            if res_text.count("{") == 1 and res_text.count("}") > 1:
                res_text = res_text.rstrip("}\n\r\t ") + "}"
            parsed = json.loads(res_text)
            
            # Validate against schema to ensure correctness
            validated = NLPParseResponse(query=query, **parsed)
            return validated.dict()
        except (json.JSONDecodeError, ValidationError, Exception) as e:
            logger.error(f"Groq API parse_genie_query failed or validation failed: {e}. Using fallback.")
            return cls._fallback_parse_genie_query(query)

    @classmethod
    def _fallback_parse_genie_query(cls, query: str) -> Dict[str, Any]:
        """
        Safe fallback — NO keyword-based language guessing for Bengali/Tamil
        (their scripts can't be reliably keyword-matched without a real dictionary).
        Just return a low-confidence, mostly-null response so downstream UI
        can gracefully say "we couldn't fully understand this query."
        """
        return {
            "query": query,
            "detected_language": "Unknown",
            "occasion_raw": query[:50],
            "occasion_category": None,
            "primary_color": None,
            "excluded_colors": [],
            "aesthetic_tags": [],
            "excluded_tags": [],
            "max_budget": None,
            "is_local_preferred": False,
            "confidence": "low",
            "ambiguous_fields": ["occasion_category", "aesthetic_tags", "primary_color"]
        }

    @classmethod
    def generate_recommendation_reason(cls, product: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        Generates a human-friendly personalized trust explanation of why a product is recommended.
        """
        region = context.get("region", "your region")
        weather = context.get("weather", "")
        festival = context.get("festival", "")
        budget = context.get("budget")

        if not settings.GROQ_API_KEY:
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
            return cls.call_groq(prompt, temperature=0.3)
        except Exception as e:
            logger.error(f"Groq API reasoning failed: {e}")
            return f"✓ Trending in {product.get('region', 'your area')} \n✓ Comfortable material \n✓ Within budget"

    @classmethod
    def summarize_reviews(cls, product_name: str, reviews: list[str]) -> str:
        """
        Summarizes customer reviews focusing on regional fit, fabric and sizing feedback.
        """
        if not settings.GROQ_API_KEY or not reviews:
            return "✓ Soft breathable fabric \n✓ Fits true to size \n✓ Highly recommended for festive wear"

        prompt = f"""
        Provide a summary of the following customer reviews for the product '{product_name}'.
        Highlight the key consensus regarding size fit, fabric comfort, and occasion suitability.
        Format as 3 short bullet points starting with '✓'. Max 25 words total.
        
        Reviews:
        {chr(10).join(reviews)}
        """
        try:
            return cls.call_groq(prompt, temperature=0.2)
        except Exception as e:
            logger.error(f"Groq API review summary failed: {e}")
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

    @classmethod
    def curate_genie_outfit(cls, occasion: str, color: Optional[str], max_budget: Optional[int]) -> List[Dict[str, Any]]:
        """
        Curation algorithm:
        1. Filters mock products by occasion and color.
        2. Groups them into TOP, BOTTOM, FOOTWEAR, and ACCESSORY.
        3. Finds a combination of 4 items whose sum is <= max_budget.
        4. Employs fallback logic if the budget is tight.
        """
        from app.services.database import MockDB
        all_products = MockDB.get_genie_products()
        
        # Filter by occasion (or default to Casual if no match)
        matched_products = [
            p for p in all_products 
            if any(occ.lower() == occasion.lower() for occ in p.get("occasions", []))
        ]
        
        if not matched_products:
            # Fallback to general Casual if specific occasion has no products
            matched_products = [
                p for p in all_products 
                if any(occ.lower() == "casual" for occ in p.get("occasions", []))
            ]

        # Filter by color if specified and available
        if color:
            color_filtered = [
                p for p in matched_products 
                if any(col.lower() == color.lower() for col in p.get("colors", []))
            ]
            if color_filtered:
                matched_products = color_filtered

        # Group by category
        categories = {"TOP": [], "BOTTOM": [], "FOOTWEAR": [], "ACCESSORY": []}
        for p in matched_products:
            cat = p.get("category")
            if cat in categories:
                categories[cat].append(p)

        # Ensure we have at least one item in each category. If not, fill from general pool
        for cat, items in categories.items():
            if not items:
                categories[cat] = [p for p in all_products if p.get("category") == cat]

        budget_limit = max_budget if max_budget else 5000

        # Try to find a combination of 4 items within budget
        best_combination = None
        min_budget_diff = float('inf')

        # Simple greedy search or random sampling to find a good combination under budget
        # Since we have a small mock DB, we can do a nested check or just pick the best matching ones
        for top in sorted(categories["TOP"], key=lambda x: x["price"]):
            for bottom in sorted(categories["BOTTOM"], key=lambda x: x["price"]):
                for footwear in sorted(categories["FOOTWEAR"], key=lambda x: x["price"]):
                    for acc in sorted(categories["ACCESSORY"], key=lambda x: x["price"]):
                        total = top["price"] + bottom["price"] + footwear["price"] + acc["price"]
                        if total <= budget_limit:
                            diff = budget_limit - total
                            if diff < min_budget_diff:
                                min_budget_diff = diff
                                best_combination = [top, bottom, footwear, acc]

        # Fallback: If no combination is under budget, pick the cheapest items in each category
        if not best_combination:
            best_combination = [
                min(categories["TOP"], key=lambda x: x["price"]),
                min(categories["BOTTOM"], key=lambda x: x["price"]),
                min(categories["FOOTWEAR"], key=lambda x: x["price"]),
                min(categories["ACCESSORY"], key=lambda x: x["price"])
            ]

        return best_combination
