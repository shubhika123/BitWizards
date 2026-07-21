import os
import sys

# Add backend to sys.path so we can import app
sys.path.append("/Users/root1/Desktop/Myntra/BitWizards/backend")

from app.config import settings
import requests

print("Testing direct request to /v1/predictions with proxy...")

try:
    response = requests.post(
        "https://api.pruna.ai/v1/predictions",
        headers={
            "Content-Type": "application/json",
            "apikey": settings.PRUNA_API_KEY,
            "Model": "p-image-try-on"
        },
        json={"input": {}}
    )
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    import traceback
    traceback.print_exc()
