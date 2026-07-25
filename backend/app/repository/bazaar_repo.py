from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlmodel import Session, select, col, func

from app.database import engine
from app.models.FestivalSchema import festival_name_to_slug
from app.models.LocalBazaarSchema import BazaarTheme, Seller, SellerCatalog
from app.models.ProductSchema import Product


def _dec(value: Optional[Decimal], default: float = 0.0) -> float:
    if value is None:
        return default
    return float(value)


def _delivery_time_from_distance(distance: float) -> str:
    if distance <= 1.5:
        return "10-15 min"
    if distance <= 2.5:
        return "20-30 min"
    if distance <= 4.0:
        return "1-2 hrs"
    if distance <= 6.0:
        return "2-3 hrs"
    return "Same-Day"


def _normalize_city_query(city: Optional[str]) -> Optional[str]:
    if not city or not str(city).strip():
        return None
    return str(city).strip().lower()


def _theme_lookup_slug(festival: Optional[str]) -> str:
    if not festival or not festival.strip():
        return "default"
    raw = festival.strip()
    if raw.lower() == "default":
        return "default"
    # Accept either display name or slug
    if "-" in raw and " " not in raw:
        return raw.lower()
    return festival_name_to_slug(raw)


class BazaarRepository:
    """SQL-backed Local Bazaar repository (Supabase Postgres or local SQLite)."""

    @staticmethod
    def get_local_boutiques(city: Optional[str] = None) -> List[Dict[str, Any]]:
        data = BazaarRepository.get_local_bazaar_data(city)
        return data.get("boutiques", [])

    @staticmethod
    def get_local_bazaar_data(city: Optional[str] = None) -> Dict[str, Any]:
        """
        Return catalog for a city.

        Raises:
            LookupError: when city is missing/unknown (no silent Belgaum fallback).
        """
        city_key = _normalize_city_query(city)
        if not city_key:
            raise LookupError("city is required")

        with Session(engine) as session:
            sellers = session.exec(
                select(Seller).where(func.lower(Seller.city) == city_key)
            ).all()

            if not sellers:
                raise LookupError(f"No bazaar catalog for city '{city}'")

            state = next((s.state for s in sellers if s.state), "") or ""
            resolved_city = sellers[0].city or city

            boutiques: List[Dict[str, Any]] = []
            seller_ids: List[int] = []
            for s in sellers:
                if s.seller_id is None:
                    continue
                seller_ids.append(s.seller_id)
                distance = _dec(s.distance_km, 15.0)
                boutiques.append(
                    {
                        "id": s.external_id or str(s.seller_id),
                        "name": s.name,
                        "rating": _dec(s.rating, 4.0),
                        "distance": distance,
                        "speciality": s.speciality or "",
                        "verified": bool(s.is_verified),
                        "x": _dec(s.map_x, 50.0),
                        "y": _dec(s.map_y, 50.0),
                        "deliveryTime": _delivery_time_from_distance(distance),
                    }
                )

            products: List[Dict[str, Any]] = []
            if seller_ids:
                rows = session.exec(
                    select(SellerCatalog, Product, Seller)
                    .join(Product, SellerCatalog.product_id == Product.id)
                    .join(Seller, SellerCatalog.seller_id == Seller.seller_id)
                    .where(col(SellerCatalog.seller_id).in_(seller_ids))
                ).all()

                for listing, product, seller in rows:
                    distance = _dec(listing.distance_km, _dec(seller.distance_km, 15.0))
                    products.append(
                        {
                            "id": product.id,
                            "name": product.name,
                            "category": product.category,
                            "price": int(float(listing.price)),
                            "originalPrice": int(
                                float(listing.original_price)
                                if listing.original_price is not None
                                else (product.original_price or product.price or 0)
                            ),
                            "image": product.image_url or "",
                            "trustScore": int(product.trust_score or 95),
                            "distance": distance,
                            "deliveryTime": listing.delivery_estimate
                            or _delivery_time_from_distance(distance),
                            "pickupTime": listing.pickup_estimate or "15 mins",
                            "boutique": seller.name,
                            "location": (seller.city or resolved_city or "").lower(),
                            "rating": float(product.rating or seller.rating or 4.5),
                            "description": product.description or "",
                        }
                    )

            return {
                "boutiques": boutiques,
                "products": products,
                "state": state,
                "resolved_city": resolved_city,
                "is_fallback": False,
            }

    @staticmethod
    def get_bazaar_cities() -> List[Dict[str, str]]:
        with Session(engine) as session:
            rows = session.exec(
                select(Seller.city, Seller.state)
                .where(Seller.city.is_not(None))
                .distinct()
            ).all()

            cities: Dict[str, str] = {}
            for city, state in rows:
                if not city:
                    continue
                # Prefer first non-empty state
                if city not in cities or (state and not cities[city]):
                    cities[city] = state or ""

            result = [
                {"city": city, "state": state}
                for city, state in cities.items()
            ]
            result.sort(key=lambda c: c["city"])
            return result

    @staticmethod
    def get_bazaar_theme(festival: Optional[str] = None) -> Dict[str, Any]:
        slug = _theme_lookup_slug(festival)
        with Session(engine) as session:
            theme = session.get(BazaarTheme, slug)
            if not theme and slug != "default":
                theme = session.get(BazaarTheme, "default")
            if not theme:
                return {
                    "name": "General Festive",
                    "hexColor": "#ff3f6c",
                    "bannerTitle": "Explore Local Sellers with ",
                    "bannerHighlight": "Trust",
                    "bannerDesc": "Handcrafted accessories, direct handlooms, and traditional clothing from trusted neighbourhood artisans.",
                    "bannerImg": "/apnabazar.png",
                    "bannerBtn": "Explore Collections",
                    "bannerBadge": "Bazaar Special",
                    "bannerTag": "SUPPORT LOCAL ARTISANS",
                    "categories": [],
                }
            payload = dict(theme.payload or {})
            return payload
