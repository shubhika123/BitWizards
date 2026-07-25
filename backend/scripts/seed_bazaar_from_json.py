"""
Seed Apna Bazaar sellers, products, listings, and themes from JSON fixtures.

Usage (from backend/):
  python -m scripts.seed_bazaar_from_json
  # or
  python scripts/seed_bazaar_from_json.py
"""

from __future__ import annotations

import json
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, Optional

from sqlmodel import Session, select

# Allow running as a script from backend/
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.database import engine  # noqa: E402
from app.models.FestivalSchema import Festival, festival_name_to_slug  # noqa: E402
from app.models.LocalBazaarSchema import BazaarTheme, Seller, SellerCatalog  # noqa: E402
from app.models.ProductSchema import Product  # noqa: E402

DATA_PATH = BACKEND_ROOT / "app" / "services" / "bazaar_data.json"
THEMES_PATH = BACKEND_ROOT / "app" / "services" / "bazaar_themes.json"


def _theme_key_to_slug(key: str) -> str:
    if key.strip().lower() == "default":
        return "default"
    return festival_name_to_slug(key)


def _as_decimal(value: Any, default: Optional[str] = None) -> Optional[Decimal]:
    if value is None:
        return Decimal(default) if default is not None else None
    return Decimal(str(value))


def seed_bazaar_from_json(session: Optional[Session] = None, force: bool = False) -> Dict[str, int]:
    """
    Upsert bazaar catalog + themes from JSON.
    Returns counts of sellers/products/listings/themes touched.
    """
    own_session = session is None
    if own_session:
        session = Session(engine)

    assert session is not None

    stats = {"sellers": 0, "products": 0, "listings": 0, "themes": 0, "festivals_slugged": 0}

    try:
        existing_sellers = session.exec(select(Seller)).first()
        if existing_sellers and not force:
            # Catalog already present — still refresh themes + festival slugs so
            # fixture edits (e.g. banner images) land without a full --force wipe.
            stats["festivals_slugged"] = _backfill_festival_slugs(session)
            stats["themes"] = _seed_themes(session)
            session.commit()
            return stats

        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Missing bazaar data fixture: {DATA_PATH}")

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            catalog: Dict[str, Any] = json.load(f)

        for city_key, entry in catalog.items():
            if not isinstance(entry, dict):
                continue
            state = entry.get("state") or ""
            city_title = city_key.replace("_", " ").strip().title()
            boutiques = entry.get("boutiques") or []
            products = entry.get("products") or []

            name_to_seller: Dict[str, Seller] = {}

            for boutique in boutiques:
                external_id = boutique.get("id")
                if not external_id:
                    continue

                seller = session.exec(
                    select(Seller).where(Seller.external_id == external_id)
                ).first()
                if not seller:
                    seller = Seller(external_id=external_id, name=boutique.get("name") or external_id)
                    session.add(seller)

                seller.name = boutique.get("name") or seller.name
                seller.seller_name = boutique.get("name")
                seller.city = city_title
                seller.state = state
                seller.speciality = boutique.get("speciality")
                seller.rating = _as_decimal(boutique.get("rating"), "4.0") or Decimal("4.0")
                seller.is_verified = bool(boutique.get("verified", True))
                seller.distance_km = _as_decimal(boutique.get("distance"))
                seller.map_x = _as_decimal(boutique.get("x"))
                seller.map_y = _as_decimal(boutique.get("y"))

                # New geo fields — latitude/longitude are now required for
                # discover-mode distance computation.
                seller.latitude = _as_decimal(boutique.get("latitude"))
                seller.longitude = _as_decimal(boutique.get("longitude"))
                if seller.latitude is None or seller.longitude is None:
                    import warnings
                    warnings.warn(
                        f"Seller {external_id!r} ({seller.name}) is missing "
                        f"latitude/longitude — discover-mode distance will skip it.",
                        stacklevel=2,
                    )
                seller.max_delivery_radius_km = _as_decimal(
                    boutique.get("max_delivery_radius_km"), "5.00"
                ) or Decimal("5.00")
                seller.same_day_capable = bool(boutique.get("same_day_capable", True))

                session.flush()
                name_to_seller[(seller.name or "").strip().lower()] = seller
                stats["sellers"] += 1


            for product_data in products:
                product_id = product_data.get("id")
                if not product_id:
                    continue

                product = session.get(Product, product_id)
                if not product:
                    product = Product(
                        id=product_id,
                        name=product_data.get("name") or product_id,
                        category=product_data.get("category") or "Miscellaneous",
                        price=float(product_data.get("price") or 0),
                        image_url=product_data.get("image") or "",
                    )
                    session.add(product)

                product.name = product_data.get("name") or product.name
                product.category = product_data.get("category") or product.category
                product.price = float(product_data.get("price") or product.price or 0)
                product.image_url = product_data.get("image") or product.image_url or ""
                product.description = product_data.get("description")
                product.original_price = (
                    float(product_data["originalPrice"])
                    if product_data.get("originalPrice") is not None
                    else product.original_price
                )
                product.rating = (
                    float(product_data["rating"])
                    if product_data.get("rating") is not None
                    else product.rating
                )
                product.trust_score = (
                    float(product_data["trustScore"])
                    if product_data.get("trustScore") is not None
                    else product.trust_score
                )
                stats["products"] += 1

                boutique_name = (product_data.get("boutique") or "").strip().lower()
                seller = name_to_seller.get(boutique_name)
                if not seller:
                    # Fallback: match any seller in this city by name
                    seller = session.exec(
                        select(Seller).where(
                            Seller.city == city_title,
                            Seller.name == product_data.get("boutique"),
                        )
                    ).first()
                if not seller:
                    raise ValueError(
                        f"No seller matched for product {product_id} boutique={product_data.get('boutique')!r} city={city_title}"
                    )

                listing = session.exec(
                    select(SellerCatalog).where(
                        SellerCatalog.seller_id == seller.seller_id,
                        SellerCatalog.product_id == product_id,
                    )
                ).first()
                if not listing:
                    listing = SellerCatalog(
                        seller_id=seller.seller_id,
                        product_id=product_id,
                        price=_as_decimal(product_data.get("price"), "0") or Decimal("0"),
                    )
                    session.add(listing)

                listing.price = _as_decimal(product_data.get("price"), "0") or Decimal("0")
                listing.original_price = _as_decimal(product_data.get("originalPrice"))
                listing.delivery_estimate = product_data.get("deliveryTime")
                listing.pickup_estimate = product_data.get("pickupTime")
                listing.distance_km = _as_decimal(product_data.get("distance"))
                listing.pickup_available = True
                stats["listings"] += 1

        stats["themes"] = _seed_themes(session)
        stats["festivals_slugged"] = _backfill_festival_slugs(session)
        session.commit()
        return stats
    except Exception:
        session.rollback()
        raise
    finally:
        if own_session:
            session.close()


def _seed_themes(session: Session) -> int:
    if not THEMES_PATH.exists():
        raise FileNotFoundError(f"Missing bazaar themes fixture: {THEMES_PATH}")

    with open(THEMES_PATH, "r", encoding="utf-8") as f:
        themes: Dict[str, Any] = json.load(f)

    count = 0
    for key, payload in themes.items():
        slug = _theme_key_to_slug(key)
        theme = session.get(BazaarTheme, slug)
        if not theme:
            theme = BazaarTheme(festival_slug=slug, payload=payload or {})
            session.add(theme)
        else:
            theme.payload = payload or {}
        count += 1
    return count


def _backfill_festival_slugs(session: Session) -> int:
    updated = 0
    festivals = session.exec(select(Festival)).all()
    for fest in festivals:
        desired = festival_name_to_slug(fest.name)
        if fest.slug != desired:
            fest.slug = desired
            updated += 1
    return updated


def main() -> None:
    force = "--force" in sys.argv
    stats = seed_bazaar_from_json(force=force)
    print("Bazaar seed complete:", stats)


if __name__ == "__main__":
    main()
