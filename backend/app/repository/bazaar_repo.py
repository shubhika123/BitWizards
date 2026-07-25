from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlmodel import Session, select, col, func

from app.database import engine
from app.models.FestivalSchema import festival_name_to_slug
from app.models.LocalBazaarSchema import BazaarTheme, Seller, SellerCatalog
from app.models.ProductSchema import Product
from app.utils.geo import haversine_km, estimate_delivery_window


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
                import os
                import glob
                
                seller_id_str = s.external_id or str(s.seller_id)
                frontend_public_dir = os.path.join(os.path.dirname(__file__), "../../../frontend/public/sellers")
                
                matching_files = glob.glob(os.path.join(frontend_public_dir, f"{seller_id_str}.*"))
                if matching_files:
                    ext = matching_files[0].split('.')[-1]
                    image_url = f"/sellers/{seller_id_str}.{ext}"
                else:
                    image_url = f"/sellers/{seller_id_str}.jpg"
                
                boutiques.append(
                    {
                        "id": seller_id_str,
                        "name": s.name,
                        "rating": _dec(s.rating, 4.0),
                        "distance": distance,
                        "speciality": s.speciality or "",
                        "verified": bool(s.is_verified),
                        "x": _dec(s.map_x, 50.0),
                        "y": _dec(s.map_y, 50.0),
                        "deliveryTime": _delivery_time_from_distance(distance),
                        "image": image_url,
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

    @staticmethod
    def get_nearby_sellers(
        session: Session,
        city: str,
        user_lat: float,
        user_lng: float,
        radius_km: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        sellers = session.exec(select(Seller).where(func.lower(Seller.city) == city.lower())).all()
        results = []
        for s in sellers:
            if s.latitude is None or s.longitude is None:
                continue
            dist = haversine_km(user_lat, user_lng, float(s.latitude), float(s.longitude))
            effective_radius = radius_km or float(s.max_delivery_radius_km)
            if dist > effective_radius:
                continue
            # Use external_id if available, fallback to str(seller_id)
            seller_id_str = s.external_id or str(s.seller_id)
            
            import os
            import glob
            frontend_public_dir = os.path.join(os.path.dirname(__file__), "../../../frontend/public/sellers")
            
            matching_files = glob.glob(os.path.join(frontend_public_dir, f"{seller_id_str}.*"))
            if matching_files:
                ext = matching_files[0].split('.')[-1]
                image_url = f"/sellers/{seller_id_str}.{ext}"
            else:
                image_url = f"/sellers/{seller_id_str}.jpg"

            results.append({
                "id": seller_id_str,
                "name": s.name,
                "rating": float(s.rating) if s.rating else 4.0,
                "distance": round(dist, 2),
                "speciality": s.speciality or "",
                "verified": bool(s.is_verified),
                "x": float(s.map_x) if s.map_x else 50.0,
                "y": float(s.map_y) if s.map_y else 50.0,
                "deliveryTime": estimate_delivery_window(dist, s.same_day_capable),
                "image": image_url,
            })
        results.sort(key=lambda r: r["distance"])
        return results

    @staticmethod
    def get_seller_catalog(session: Session, seller_id: str) -> Dict[str, Any]:
        """Powers 'enter shop' — full product list for one seller."""
        # seller_id from frontend is usually external_id (e.g. 'b_ganesh_1')
        seller = session.exec(select(Seller).where(Seller.external_id == seller_id)).first()
        if not seller:
            # Fallback to internal integer ID if needed
            try:
                seller = session.exec(select(Seller).where(Seller.seller_id == int(seller_id))).first()
            except ValueError:
                pass

        if not seller:
            raise LookupError(f"Seller {seller_id} not found")

        rows = session.exec(
            select(SellerCatalog, Product)
            .join(Product, SellerCatalog.product_id == Product.id)
            .where(SellerCatalog.seller_id == seller.seller_id)
        ).all()

        products = []
        for catalog_row, product in rows:
            products.append({
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": int(float(catalog_row.price)),
                "originalPrice": int(
                    float(catalog_row.original_price)
                    if catalog_row.original_price is not None
                    else (product.original_price or product.price or 0)
                ),
                "image": product.image_url or "",
                "description": product.description or "",
                "trustScore": int(product.trust_score or 95),
                "rating": float(product.rating or 4.5),
                "stock_qty": catalog_row.stock_qty,
            })

        return {
            "seller": {
                "id": seller.external_id or str(seller.seller_id),
                "name": seller.name,
                "rating": float(seller.rating) if seller.rating else 4.0,
                "is_verified": bool(seller.is_verified),
            },
            "products": products
        }

    @staticmethod
    def search_products(
        session: Session,
        query: str,
        city: str,
        user_lat: float,
        user_lng: float,
    ) -> List[Dict[str, Any]]:
        rows = session.exec(
            select(SellerCatalog, Product, Seller)
            .join(Product, SellerCatalog.product_id == Product.id)
            .join(Seller, SellerCatalog.seller_id == Seller.seller_id)
            .where(func.lower(Seller.city) == city.lower())
            .where(Product.name.ilike(f"%{query}%"))
        ).all()

        grouped: Dict[str, Dict[str, Any]] = {}
        for catalog_row, product, seller in rows:
            if seller.latitude is None or seller.longitude is None:
                continue
            dist = haversine_km(user_lat, user_lng, float(seller.latitude), float(seller.longitude))
            
            if product.id not in grouped:
                grouped[product.id] = {
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "category": product.category,
                        "image_url": product.image_url or "",
                        "description": product.description or "",
                        "rating": float(product.rating or 4.5),
                        "trustScore": int(product.trust_score or 95),
                    },
                    "offers": []
                }
            
            grouped[product.id]["offers"].append({
                "seller_id": seller.external_id or str(seller.seller_id),
                "seller_name": seller.name,
                "is_verified": bool(seller.is_verified),
                "price": int(float(catalog_row.price)),
                "original_price": int(
                    float(catalog_row.original_price)
                    if catalog_row.original_price is not None
                    else (product.original_price or product.price or 0)
                ),
                "distance_km": round(dist, 2),
                "delivery_estimate": estimate_delivery_window(dist, seller.same_day_capable),
            })

        for entry in grouped.values():
            entry["offers"].sort(key=lambda o: o["price"])

        return list(grouped.values())
