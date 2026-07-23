import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment.")
    exit(1)

print("Testing Gemini REST API...")
url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
headers = {"Content-Type": "application/json"}
payload = {
    "model": "models/text-embedding-004",
    "content": {
        "parts": [{"text": "Casual Wear under 2000 in Patna"}]
    }
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    response.raise_for_status()
    data = response.json()
    values = data.get("embedding", {}).get("values", [])
    print(f"Embedding length: {len(values)}")
    print(f"First 5 values: {values[:5]}")
except Exception as e:
    print(f"Failed: {e}")
    if 'response' in locals():
        print(f"Response content: {response.text}")
