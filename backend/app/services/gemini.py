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
You are a highly advanced multilingual fashion intelligence engine for an Indian e-commerce platform.
Your task is to parse unstructured, conversational user queries into strict, normalized JSON data.

The queries will arrive in English, Hindi, Hinglish, Bengali, Tamil, or Bhojpuri. 

### Extraction & Normalization Rules:

1. **detected_language**: Identify the predominant language/script. Choose EXACTLY from: ["English", "Hindi", "Hinglish", "Bengali", "Tamil", "Bhojpuri", "Unknown"].
2. **occasion_raw**: The actual event the user is attending. 
   - CRITICAL: Timeframes ("today", "tomorrow", "next week", "urgent") are NOT occasions. If no specific event (like wedding, party, office) is mentioned, set this to null.
3. **occasion_category**: Map the occasion to EXACTLY one: ["Casual", "Formal", "Wedding", "Party", "Festive", "Date", "Work", "Religious", "Other"].
4. **target_items**: Extract the base clothing item requested (e.g., ["saree"], ["sherwani"], ["kurta set"], ["lehenga"]). 
   - Strip colors and adjectives out of the item name (e.g., "white kasavu saree" becomes ["kasavu saree"]).
5. **primary_color**: The explicitly wanted color in English.
6. **excluded_colors**: Colors explicitly rejected (e.g., "no black", "avoid red").
7. **aesthetic_tags**: ONLY structural fashion styles (e.g., "traditional", "minimalist", "streetwear", "boho", "heavy"). 
   - CRITICAL NEGATIVE RULE: You MUST leave this array empty [] rather than including subjective quality words ("beautiful", "best", "good", "accha") or pricing words ("affordable", "sasta", "cheap").
8. **excluded_tags**: Style types rejected (e.g., "nothing too formal" -> ["formal"]).
9. **max_budget**: Convert ANY budget mention into a clean integer in INR ("8k" -> 8000, "৫০০০" -> 5000). Set to null if missing.
10. **is_local_preferred**: true ONLY if the user asks for physical/nearby stores ("local market", "nearby shop").
11. **confidence**: Rate as "high", "medium", or "low".

Return ONLY a valid, minified JSON object matching this schema. No markdown wrapping, no trailing text.

{
  "detected_language": "",
  "occasion_raw": null,
  "occasion_category": null,
  "target_items": [],
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
### Input/Output Examples for Calibration:

Query: "kal ke liye kuch sasta dikhao"
Output: {"detected_language": "Hinglish", "occasion_raw": null, "occasion_category": null, "target_items": [], "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": null, "is_local_preferred": false, "confidence": "medium", "ambiguous_fields": ["target_items", "occasion_category"]}

Query: "shaadi khatir ek accha sa, beautiful, and best outfit chahiye"
Output: {"detected_language": "Bhojpuri", "occasion_raw": "wedding", "occasion_category": "Wedding", "target_items": ["outfit"], "primary_color": null, "excluded_colors": [], "aesthetic_tags": [], "excluded_tags": [], "max_budget": null, "is_local_preferred": false, "confidence": "high", "ambiguous_fields": []}

Query: "bhaiya ek badhiya sa onam ke liye white kasavu saree dikhao under 3k"
Output: {"detected_language": "Hinglish", "occasion_raw": "Onam", "occasion_category": "Festive", "target_items": ["kasavu saree"], "primary_color": "white", "excluded_colors": [], "aesthetic_tags": ["traditional"], "excluded_tags": [], "max_budget": 3000, "is_local_preferred": false, "confidence": "high", "ambiguous_fields": []}

Now completely parse this specific user query:
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
        if not settings.GROQ_API_KEY:
            return cls._fallback_parse_genie_query(query)

        prompt = GENIE_PARSE_PROMPT.replace("{user_query}", query)
        try:
            res_text = cls.call_groq(prompt, temperature=0.1, json_mode=True)
            
            # Clean up raw markdown fences cleanly if they leak past json_mode
            if "```" in res_text:
                res_text = re.sub(r"^```(?:json)?\n|```$", "", res_text, flags=re.MULTILINE).strip()
            
            parsed = json.loads(res_text)
            
            # Dynamically ensure the incoming text context matches Pydantic expectations
            if "query" not in parsed:
                parsed["query"] = query

                
            validated = NLPParseResponse(**parsed)
            return validated.dict()
            
        except (json.JSONDecodeError, ValidationError, Exception) as e:
            logger.error(f"Advanced parse execution failed: {e}. Falling back safely.")
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
        from app.repository.product_repo import ProductRepository
        all_products = ProductRepository.get_genie_products()
        
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
