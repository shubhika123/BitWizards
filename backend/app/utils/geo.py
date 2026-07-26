"""
Geospatial utilities for Apna Bazaar — distance computation and delivery
time estimation.

All distance calculations use the Haversine formula.  Delivery window
strings are the single source of truth for the copy shown in the UI,
replacing the inline threshold logic that was previously duplicated in
bazaar_repo.py.
"""

from __future__ import annotations

import math
from typing import Tuple


# ---------------------------------------------------------------------------
# Haversine
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km between two (lat, lng) points."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Delivery window estimation
# ---------------------------------------------------------------------------

def estimate_delivery_window(distance_km: float, same_day_capable: bool) -> str:
    """Single source of truth for the delivery-time copy shown in the UI."""
    if distance_km <= 1.5:
        return "10-15 min"
    if distance_km <= 3:
        return "20-30 min"
    if distance_km <= 6 and same_day_capable:
        return "Same-day"
    if same_day_capable:
        return "Same-day (extended)"
    return "1-2 days"


# ---------------------------------------------------------------------------
# City centroid fallback
# ---------------------------------------------------------------------------

# Approximate city-centre coordinates for fallback when the user has not
# granted GPS permission.  Add entries here as new cities are seeded.
_CITY_CENTROIDS: dict[str, Tuple[float, float]] = {
    "belgaum":    (15.8497, 74.4977),
    "vizag":      (17.6868, 83.2185),
    "patna":      (25.6093, 85.1376),
    "amritsar":   (31.6340, 74.8723),
    "kolkata":    (22.5726, 88.3639),
    "guwahati":   (26.1445, 91.7362),
    "coimbatore": (11.0168, 76.9558),
}


def get_city_centroid(city: str) -> Tuple[float, float]:
    """
    Return (latitude, longitude) for the approximate centre of *city*.

    Falls back to (0.0, 0.0) for unknown cities — callers should treat a
    (0, 0) result as "no valid location available".
    """
    return _CITY_CENTROIDS.get(city.strip().lower(), (0.0, 0.0))
