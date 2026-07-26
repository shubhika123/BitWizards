"""
One-time script to backfill bazaar_data.json with latitude/longitude,
max_delivery_radius_km, and same_day_capable for every boutique.

Run from backend/:
  python -c "exec(open('app/utils/_backfill_latlng.py').read())"
"""

import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "services" / "bazaar_data.json"

# Real-world approximate coordinates per city, with slight offsets per boutique
# to simulate realistic spread within the city.
COORDS = {
    "belgaum": {
        "b_ganesh_1": (15.8513, 74.5013),  # near city centre
        "b_ganesh_2": (15.8620, 74.4890),  # ~1.5 km NW
        "b_ganesh_3": (15.8400, 74.5120),  # ~2 km SE
    },
    "vizag": {
        "b_vratam_1": (17.6868, 83.2185),  # RK Beach area
        "b_vratam_2": (17.6950, 83.2300),  # Dwaraka Nagar
        "b_vratam_3": (17.6750, 83.2050),  # MVP Colony
    },
    "amritsar": {
        "b_lohri_1": (31.6340, 74.8723),  # near Golden Temple
        "b_lohri_2": (31.6420, 74.8600),  # Hall Bazaar
        "b_lohri_3": (31.6250, 74.8850),  # Katra Jaimal Singh
    },
    "kolkata": {
        "b_durga_1": (22.5958, 88.3590),  # Kumartuli
        "b_durga_2": (22.5260, 88.3440),  # Kalighat
        "b_durga_3": (22.5726, 88.3639),  # College Street area
    },
    "guwahati": {
        "b_guw_1": (26.1445, 91.7362),  # Fancy Bazaar
        "b_guw_2": (26.1550, 91.7480),  # Ganeshguri
        "b_guw_3": (26.1350, 91.7250),  # Pan Bazaar
    },
    "patna": {
        "b_chhath_1": (25.6093, 85.1376),  # Gandhi Maidan area
        "b_chhath_2": (25.6180, 85.1500),  # Boring Road
        "b_chhath_3": (25.5990, 85.1250),  # Bankipore
    },
    "coimbatore": {
        "b_coi_1": (11.0168, 76.9558),  # RS Puram
        "b_coi_2": (11.0050, 76.9700),  # Town Hall
        "b_coi_3": (11.0250, 76.9420),  # Gandhipuram
    },
}

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

for city_key, entry in data.items():
    city_coords = COORDS.get(city_key, {})
    for boutique in entry.get("boutiques", []):
        bid = boutique.get("id")
        if bid in city_coords:
            lat, lng = city_coords[bid]
            boutique["latitude"] = lat
            boutique["longitude"] = lng
        boutique.setdefault("max_delivery_radius_km", 5.0)
        boutique.setdefault("same_day_capable", True)

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done — backfilled lat/lng for all boutiques.")
