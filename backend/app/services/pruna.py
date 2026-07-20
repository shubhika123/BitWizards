import base64
import logging
import requests
from pathlib import Path
from typing import List
from app.config import settings

logger = logging.getLogger("pruna")

PRUNA_FILES_URL = "http://localhost:3000/pruna-api/v1/files"
PRUNA_PREDICTIONS_URL = "http://localhost:3000/pruna-api/v1/predictions"

# Absolute path to the frontend's public directory where catalog images live
FRONTEND_PUBLIC_DIR = Path(__file__).resolve().parents[3] / "frontend" / "public"


class PrunaService:

    @staticmethod
    def _upload_bytes(image_bytes: bytes, filename: str) -> str:
        """
        Uploads raw image bytes to Pruna AI /v1/files and returns the hosted GET URL.
        
        The Pruna API response structure is:
            { ..., "urls": { "get": "https://api.pruna.ai/v1/files/<id>" } }
        """
        logger.info(f"  [UPLOAD] Uploading '{filename}' ({len(image_bytes)} bytes) → {PRUNA_FILES_URL}")

        response = requests.post(
            PRUNA_FILES_URL,
            headers={"apikey": settings.PRUNA_API_KEY},
            files={"content": (filename, image_bytes, "image/png")}
        )

        logger.info(f"  [UPLOAD] Response status: {response.status_code}")
        response.raise_for_status()

        data = response.json()
        logger.info(f"  [UPLOAD] Response JSON: {data}")

        url = (data.get("urls") or {}).get("get") or data.get("url") or data.get("file_url")
        if not url:
            raise ValueError(f"[UPLOAD] Could not find a URL in Pruna /v1/files response: {data}")

        logger.info(f"  [UPLOAD] ✅ Pruna hosted URL: {url}")
        return url

    @staticmethod
    def _upload_from_base64(base64_str: str, filename: str) -> str:
        """Decodes a base64 data-URL string and uploads the raw bytes to Pruna."""
        logger.info(f"  [ENCODE] Decoding base64 for '{filename}'...")
        if base64_str.startswith("data:image"):
            _, base64_data = base64_str.split(",", 1)
        else:
            base64_data = base64_str
        image_bytes = base64.b64decode(base64_data)
        logger.info(f"  [ENCODE] Decoded to {len(image_bytes)} bytes.")
        return PrunaService._upload_bytes(image_bytes, filename)

    @staticmethod
    def _upload_from_local_path(relative_url: str, filename: str) -> str:
        """
        Resolves a frontend public path (e.g. '/catalog/top_001.png') to an
        absolute filesystem path and uploads the raw file to Pruna directly.
        """
        local_path = FRONTEND_PUBLIC_DIR / relative_url.lstrip("/")
        logger.info(f"  [LOCAL] Resolving '{relative_url}' → '{local_path}'")

        if not local_path.exists():
            raise FileNotFoundError(f"[LOCAL] File not found on disk: {local_path}")

        image_bytes = local_path.read_bytes()
        logger.info(f"  [LOCAL] Read {len(image_bytes)} bytes from disk.")
        return PrunaService._upload_bytes(image_bytes, filename)

    @staticmethod
    def generate_try_on(person_image_b64: str, garment_image_inputs: List[str]) -> str:
        """
        Full pipeline:
          1. Upload person photo (comes as base64 from browser)
          2. Upload each garment image (either local /catalog/ path or base64)
          3. POST to /v1/predictions with Try-Sync: true
          4. Extract and return the output image URL

        Args:
            person_image_b64:    base64 data-URL of the user's photo
            garment_image_inputs: list of either local public paths ('/catalog/...') or base64 strings
        """
        # MOCK FOR TESTING - Un-comment below line to re-enable actual API calls
        # return "/digital-twin/base-avatar.png"
        
        if not settings.PRUNA_API_KEY:
            raise ValueError("PRUNA_API_KEY is not configured in backend .env")

        logger.info("=" * 60)
        logger.info("PRUNA VIRTUAL TRY-ON PIPELINE STARTED")
        logger.info("=" * 60)

        # ── Step 1: Upload person image ────────────────────────────────
        logger.info("\n[Step 1] Uploading person image (from browser base64)...")
        person_url = PrunaService._upload_from_base64(person_image_b64, "person.png")
        logger.info(f"[Step 1] ✅ Person URL: {person_url}")

        # ── Step 2: Upload garment images ──────────────────────────────
        garment_urls: List[str] = []
        for idx, garment_input in enumerate(garment_image_inputs):
            logger.info(f"\n[Step 2.{idx+1}] Uploading garment {idx+1}/{len(garment_image_inputs)}...")

            if garment_input.startswith("/catalog/") or garment_input.startswith("/public/"):
                # It's a local file path from the frontend public folder
                g_url = PrunaService._upload_from_local_path(garment_input, f"garment_{idx}.png")
            else:
                # It's a base64 data-URL (fallback)
                g_url = PrunaService._upload_from_base64(garment_input, f"garment_{idx}.png")

            garment_urls.append(g_url)
            logger.info(f"[Step 2.{idx+1}] ✅ Garment {idx+1} URL: {g_url}")

        logger.info(f"\n[Step 2] ✅ All {len(garment_urls)} garment(s) uploaded.")

        # ── Step 3: Run virtual try-on prediction ──────────────────────
        payload = {
            "input": {
                "person_image": person_url,
                "garment_images": garment_urls,
                "prompt": ""
            }
        }

        logger.info(f"\n[Step 3] Calling Pruna predictions endpoint (Try-Sync: true)...")
        logger.info(f"  [PREDICT] Payload: person_image={person_url}")
        logger.info(f"  [PREDICT] Payload: garment_images={garment_urls}")

        response = requests.post(
            PRUNA_PREDICTIONS_URL,
            headers={
                "Content-Type": "application/json",
                "apikey": settings.PRUNA_API_KEY,
                "Model": "p-image-try-on",
                "Try-Sync": "true"
            },
            json=payload,
            timeout=120  # Try-Sync can take up to ~60s, give it breathing room
        )

        logger.info(f"  [PREDICT] Response status: {response.status_code}")
        response.raise_for_status()

        data = response.json()
        logger.info(f"  [PREDICT] Full Response JSON: {data}")

        # ── Step 4: Extract final image URL ────────────────────────────
        # Actual Pruna Try-Sync response: { "status": "succeeded", "generation_url": "https://..." }
        # Fallback: { "output": ["https://..."] } or { "output": { "image_url": "..." } }
        logger.info(f"\n[Step 4] Extracting output image URL from response...")

        final_url: str | None = (
            # Primary: synchronous response has generation_url at top level
            data.get("generation_url")
            # Fallback A: output is a list
            or (data.get("output")[0] if isinstance(data.get("output"), list) and data.get("output") else None)
            # Fallback B: output is a dict with image_url
            or (data.get("output", {}).get("image_url") if isinstance(data.get("output"), dict) else None)
            # Fallback C: output is a plain string
            or (data.get("output") if isinstance(data.get("output"), str) else None)
        )

        if not final_url:
            raise ValueError(f"[Step 4] ❌ Could not find image URL in Pruna response: {data}")

        logger.info(f"[Step 4] ✅ Final output image URL: {final_url}")
        logger.info("=" * 60)
        logger.info("PRUNA VIRTUAL TRY-ON PIPELINE COMPLETE ✅")
        logger.info("=" * 60)

        return final_url
