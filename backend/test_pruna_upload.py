import os
import sys
import base64
import requests

# Add backend to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

print("==================================================")
print("   PRUNA AI FILE UPLOAD TEST DIAGNOSTIC TOOL      ")
print("==================================================")

print("[Step 1] Verifying API Key configuration...")
if settings.PRUNA_API_KEY:
    print(f"  -> SUCCESS: API Key loaded (starts with {settings.PRUNA_API_KEY[:4]}...)")
else:
    print("  -> ERROR: PRUNA_API_KEY is empty in .env!")
    sys.exit(1)

print("\n[Step 2] Creating dummy image payload...")
# A tiny 1x1 PNG pixel encoded in Base64
dummy_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
header, base64_data = dummy_b64.split(",", 1)
image_bytes = base64.b64decode(base64_data)
print(f"  -> SUCCESS: Created {len(image_bytes)} bytes of mock PNG data.")

print("\n[Step 3] Sending POST request to Next.js proxy (http://localhost:3000/pruna-api/v1/files)...")
try:
    response = requests.post(
        "http://localhost:3000/pruna-api/v1/files",
        headers={"apikey": settings.PRUNA_API_KEY},
        files={"content": ("test.png", image_bytes, "image/png")}
    )
    
    print(f"\n[Step 4] Received Response from Proxy:")
    print(f"  -> HTTP Status Code: {response.status_code}")
    print(f"  -> Raw Response Body: {response.text}")
    
    response.raise_for_status()
    print("\n[Step 5] Parsing JSON Response...")
    data = response.json()
    print(f"  -> Parsed JSON: {data}")
    
    url = data.get("url") or data.get("file_url") or (list(data.values())[0] if isinstance(data, dict) else data)
    print(f"\n✅ UPLOAD SUCCESSFUL! File URL: {url}")
    
except requests.exceptions.RequestException as e:
    print(f"\n❌ UPLOAD FAILED! Request Error: {e}")
except Exception as e:
    print(f"\n❌ UNEXPECTED ERROR: {e}")
