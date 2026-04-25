"""
data_generator.py — Synthetic data generation for Goa 1km grid.

Generates realistic proxy signals seeded with real Goa geography:
urban centers, beach corridors, known informal hotspots, road networks.
"""

import json
import math
import os
import random
from typing import List, Dict

# Goa bounding box
LAT_MIN, LAT_MAX = 14.88, 15.80
LNG_MIN, LNG_MAX = 73.68, 74.33

# ~3.3km in degrees at Goa's latitude (~15°N)
CELL_SIZE_LAT = 0.03  # ~3.3km
CELL_SIZE_LNG = 0.03  # ~3.3km (adjusted for longitude at 15°N)

# ── Known geographic features ──────────────────────────────────────────

# Major urban centers (lat, lng, radius_of_influence_km, intensity)
URBAN_CENTERS = [
    {"name": "Panaji", "lat": 15.4989, "lng": 73.8278, "radius": 4.0, "intensity": 0.95},
    {"name": "Margao", "lat": 15.2832, "lng": 73.9862, "radius": 3.5, "intensity": 0.90},
    {"name": "Mapusa", "lat": 15.5922, "lng": 73.8086, "radius": 2.5, "intensity": 0.80},
    {"name": "Vasco da Gama", "lat": 15.3982, "lng": 73.8113, "radius": 3.0, "intensity": 0.85},
    {"name": "Ponda", "lat": 15.4034, "lng": 74.0079, "radius": 2.0, "intensity": 0.65},
    {"name": "Bicholim", "lat": 15.5935, "lng": 74.0013, "radius": 1.5, "intensity": 0.50},
    {"name": "Curchorem", "lat": 15.2637, "lng": 74.1083, "radius": 1.5, "intensity": 0.45},
    {"name": "Cuncolim", "lat": 15.1771, "lng": 73.9944, "radius": 1.5, "intensity": 0.45},
]

# Known informal economy hotspots — these get the shadow economy signal pattern
INFORMAL_HOTSPOTS = [
    {"name": "Mapusa Market", "lat": 15.5922, "lng": 73.8086, "radius": 1.5, "intensity": 0.95},
    {"name": "Anjuna Flea Market", "lat": 15.5734, "lng": 73.7414, "radius": 2.0, "intensity": 0.90},
    {"name": "Panaji Municipal Market", "lat": 15.4963, "lng": 73.8260, "radius": 1.0, "intensity": 0.85},
    {"name": "Calangute Beach Corridor", "lat": 15.5438, "lng": 73.7554, "radius": 2.5, "intensity": 0.88},
    {"name": "Margao Market", "lat": 15.2832, "lng": 73.9862, "radius": 1.5, "intensity": 0.85},
    {"name": "Baga Beach Strip", "lat": 15.5558, "lng": 73.7514, "radius": 1.5, "intensity": 0.82},
    {"name": "Colva Beach Area", "lat": 15.2789, "lng": 73.9222, "radius": 2.0, "intensity": 0.75},
    {"name": "Arambol Beach", "lat": 15.6868, "lng": 73.7042, "radius": 1.5, "intensity": 0.70},
]
#Replace with API Data

# Beach corridor (high mobility + tourism but lower formal presence)
BEACH_POINTS = [
    {"lat": 15.7133, "lng": 73.6963},  # Querim
    {"lat": 15.6868, "lng": 73.7042},  # Arambol
    {"lat": 15.6518, "lng": 73.7284},  # Mandrem
    {"lat": 15.6313, "lng": 73.7354},  # Ashwem
    {"lat": 15.6093, "lng": 73.7374},  # Morjim
    {"lat": 15.5734, "lng": 73.7414},  # Anjuna
    {"lat": 15.5558, "lng": 73.7514},  # Baga
    {"lat": 15.5438, "lng": 73.7554},  # Calangute
    {"lat": 15.5160, "lng": 73.7650},  # Candolim
    {"lat": 15.4755, "lng": 73.7800},  # Miramar
    {"lat": 15.3728, "lng": 73.7854},  # Bogmalo
    {"lat": 15.2789, "lng": 73.9222},  # Colva
    {"lat": 15.2537, "lng": 73.9372},  # Benaulim
    {"lat": 15.2268, "lng": 73.9610},  # Varca
    {"lat": 15.0082, "lng": 74.0236},  # Palolem
]

# Major road corridor (NH66 runs roughly N-S through Goa)
NH66_POINTS = [
    {"lat": 15.7500, "lng": 73.8600},
    {"lat": 15.6500, "lng": 73.8200},
    {"lat": 15.5922, "lng": 73.8086},  # Mapusa
    {"lat": 15.4989, "lng": 73.8278},  # Panaji
    {"lat": 15.3982, "lng": 73.8113},  # Vasco
    {"lat": 15.2832, "lng": 73.9862},  # Margao
    {"lat": 15.1771, "lng": 73.9944},  # Cuncolim
    {"lat": 15.0082, "lng": 74.0236},  # South
]


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def distance_to_nearest(lat: float, lng: float, points: List[Dict]) -> float:
    """Return the minimum distance in km from (lat, lng) to any point in the list."""
    return min(haversine_km(lat, lng, p["lat"], p["lng"]) for p in points)


def influence_from_centers(lat: float, lng: float, centers: List[Dict]) -> float:
    """Compute combined influence score from multiple centers (Gaussian decay)."""
    total = 0.0
    for c in centers:
        dist = haversine_km(lat, lng, c["lat"], c["lng"])
        decay = math.exp(-0.5 * (dist / c["radius"]) ** 2)
        total += c["intensity"] * decay
    return min(total, 1.0)


def generate_grid() -> List[Dict]:
    """Generate all grid cells covering Goa with realistic proxy signals."""
    random.seed(42)
    cells = []
    cell_id = 0

    lat = LAT_MIN
    while lat < LAT_MAX:
        lng = LNG_MIN
        while lng < LNG_MAX:
            center_lat = lat + CELL_SIZE_LAT / 2
            center_lng = lng + CELL_SIZE_LNG / 2

            # ── Light Score ──
            # Higher near urban centers + beach tourist areas
            urban_light = influence_from_centers(center_lat, center_lng, URBAN_CENTERS)
            beach_dist = distance_to_nearest(center_lat, center_lng, BEACH_POINTS)
            beach_light = max(0, 0.5 * math.exp(-0.3 * beach_dist))
            # Informal hotspots also generate light
            informal_light = influence_from_centers(center_lat, center_lng, INFORMAL_HOTSPOTS) * 0.4
            light_score = min(urban_light + beach_light + informal_light + random.gauss(0, 0.05), 1.0)
            light_score = max(0, light_score)

            # ── Registered Density (formal businesses) ──
            # High in urban centers, LOW in informal hotspots
            formal = influence_from_centers(center_lat, center_lng, URBAN_CENTERS) * 0.9
            # Informal hotspots SUPPRESS formal density
            informal_suppress = influence_from_centers(center_lat, center_lng, INFORMAL_HOTSPOTS) * 0.5
            registered_density = max(0, formal - informal_suppress * 0.6 + random.gauss(0, 0.04))
            registered_density = min(registered_density, 1.0)

            # ── Population Density ──
            # High in urban + residential areas
            pop = influence_from_centers(center_lat, center_lng, URBAN_CENTERS) * 0.85
            # Informal hotspots tend to be populated
            informal_pop = influence_from_centers(center_lat, center_lng, INFORMAL_HOTSPOTS) * 0.6
            # Beach areas have moderate population (tourists)
            beach_pop = max(0, 0.35 * math.exp(-0.25 * beach_dist))
            population_density = min(pop + informal_pop + beach_pop + random.gauss(0, 0.05), 1.0)
            population_density = max(0, population_density)

            # ── Mobility Score (road network proxy) ──
            # Higher along NH66 and near urban centers
            nh66_dist = distance_to_nearest(center_lat, center_lng, NH66_POINTS)
            road_mobility = max(0, 0.8 * math.exp(-0.2 * nh66_dist))
            urban_mobility = influence_from_centers(center_lat, center_lng, URBAN_CENTERS) * 0.5
            beach_mobility = max(0, 0.4 * math.exp(-0.3 * beach_dist))
            mobility_score = min(road_mobility + urban_mobility + beach_mobility + random.gauss(0, 0.04), 1.0)
            mobility_score = max(0, mobility_score)

            cells.append({
                "cell_id": f"GOA_{cell_id:04d}",
                "lat": round(center_lat, 6),
                "lng": round(center_lng, 6),
                "bounds": {
                    "south": round(lat, 6),
                    "north": round(lat + CELL_SIZE_LAT, 6),
                    "west": round(lng, 6),
                    "east": round(lng + CELL_SIZE_LNG, 6),
                },
                "light_score": round(light_score, 4),
                "registered_density": round(registered_density, 4),
                "population_density": round(population_density, 4),
                "mobility_score": round(mobility_score, 4),
            })
            cell_id += 1
            lng += CELL_SIZE_LNG
        lat += CELL_SIZE_LAT

    print(f"Generated {len(cells)} grid cells covering Goa")
    return cells


def save_cells(cells: List[Dict], output_path: str = None):
    """Save generated cells to JSON."""
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "data", "raw_cells.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(cells, f, indent=2)
    print(f"Saved to {output_path}")


if __name__ == "__main__":
    cells = generate_grid()
    save_cells(cells)
    # Quick stats
    lights = [c["light_score"] for c in cells]
    formals = [c["registered_density"] for c in cells]
    pops = [c["population_density"] for c in cells]
    mobs = [c["mobility_score"] for c in cells]
    print(f"Light:  min={min(lights):.3f} max={max(lights):.3f} mean={sum(lights)/len(lights):.3f}")
    print(f"Formal: min={min(formals):.3f} max={max(formals):.3f} mean={sum(formals)/len(formals):.3f}")
    print(f"Pop:    min={min(pops):.3f} max={max(pops):.3f} mean={sum(pops)/len(pops):.3f}")
    print(f"Mob:    min={min(mobs):.3f} max={max(mobs):.3f} mean={sum(mobs)/len(mobs):.3f}")
