"""
data_loader.py — Load and merge real JSON data from the data/ directory.

Replaces the synthetic data_generator.py by reading actual data files:
  - light_intensity_zones.json  → light_score
  - mobility.json               → mobility_score
  - population.json             → population_density
  - zones_with_density.json     → registered_density (formal business density)

All four datasets share the same grid. The zone-based files (light, mobility,
density) use zone_id (e.g. "ZONE_0_0"), while population uses cell_id
(e.g. "GOA_0000"). Both follow the same row-major ordering so we can join
by positional index or by matching lat/lng centers.
"""

import json
import os
from typing import List, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _load_json(filename: str) -> List[Dict]:
    """Load a JSON array from the data directory."""
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r") as f:
        return json.load(f)


def _build_zone_lookup(records: List[Dict], key_field: str = "zone_id") -> Dict[str, Dict]:
    """Build a dict keyed by zone_id for O(1) lookups."""
    return {r[key_field]: r for r in records}


def load_real_data() -> List[Dict]:
    """
    Load and merge all four real data sources into a unified cell list
    matching the format expected by ml_pipeline.run_pipeline().

    Each cell dict has:
        cell_id, lat, lng, bounds,
        light_score, registered_density, population_density, mobility_score
    """
    print("Loading real data from JSON files...")

    # Load all four datasets
    light_data = _load_json("light_intensity_zones.json")
    mobility_data = _load_json("mobility.json")
    population_data = _load_json("population.json")
    density_data = _load_json("zones_with_density.json")

    print(f"  light_intensity_zones.json : {len(light_data)} zones")
    print(f"  mobility.json              : {len(mobility_data)} zones")
    print(f"  population.json            : {len(population_data)} cells")
    print(f"  zones_with_density.json    : {len(density_data)} zones")

    # Build lookups for zone-based files (all keyed by zone_id)
    mobility_lookup = _build_zone_lookup(mobility_data)
    density_lookup = _build_zone_lookup(density_data)

    # Population uses cell_id (GOA_XXXX) but follows the same grid order.
    # Build a lookup by (lat, lng) rounded to match zone centers.
    pop_lookup = {}
    for rec in population_data:
        # Round to 4 decimal places to match across datasets
        key = (round(rec["lat"], 4), round(rec["lng"], 4))
        pop_lookup[key] = rec

    cells = []
    for i, light_rec in enumerate(light_data):
        zone_id = light_rec["zone_id"]

        # Get center coordinates from the light data (canonical grid)
        center_lat = light_rec["center_lat"]
        center_lng = light_rec["center_lng"]
        bounds = light_rec["bounds"]

        # Look up matching records from other datasets
        mob_rec = mobility_lookup.get(zone_id, {})
        den_rec = density_lookup.get(zone_id, {})

        # Population lookup by lat/lng (rounded)
        pop_key = (round(center_lat, 4), round(center_lng, 4))
        pop_rec = pop_lookup.get(pop_key, {})

        # Build the cell_id in the format the pipeline expects
        cell_id = f"GOA_{i:04d}"

        cells.append({
            "cell_id": cell_id,
            "lat": round(center_lat, 6),
            "lng": round(center_lng, 6),
            "bounds": {
                "south": round(bounds["south"], 6),
                "north": round(bounds["north"], 6),
                "west": round(bounds["west"], 6),
                "east": round(bounds["east"], 6),
            },
            "light_score": light_rec.get("light_score", 0.0),
            "registered_density": den_rec.get("density", 0.0),
            "population_density": pop_rec.get("population_density", 0.0),
            "mobility_score": mob_rec.get("mobility_score", 0.0),
        })

    print(f"Merged {len(cells)} grid cells from real data")

    # Quick sanity stats
    for feature in ["light_score", "registered_density", "population_density", "mobility_score"]:
        vals = [c[feature] for c in cells]
        non_zero = sum(1 for v in vals if v > 0)
        print(f"  {feature:25s}: min={min(vals):.4f}  max={max(vals):.4f}  "
              f"mean={sum(vals)/len(vals):.4f}  non-zero={non_zero}/{len(vals)}")

    return cells


def save_cells(cells: List[Dict], output_path: str = None):
    """Save merged cells to JSON (replaces raw_cells.json with real data)."""
    if output_path is None:
        output_path = os.path.join(DATA_DIR, "raw_cells.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(cells, f, indent=2)
    print(f"Saved to {output_path}")


if __name__ == "__main__":
    cells = load_real_data()
    save_cells(cells)
