import requests
import json
import math
import os

# -------------------------
# CONFIG
# -------------------------

LAT_MIN = 14.88
LAT_MAX = 15.80

LNG_MIN = 73.68
LNG_MAX = 74.33

CELL_SIZE = 0.045  # ~4 km grid

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OUTPUT_FILE = "zoned_businesses.json"


QUERY = """
[out:json][timeout:25];
area["name"="Goa"]->.searchArea;

(
  node["shop"](area.searchArea);
  node["office"](area.searchArea);
  node["amenity"="restaurant"](area.searchArea);
);

out body;
"""


# -------------------------
# STEP 1 — FETCH BUSINESSES
# -------------------------

def fetch_osm_businesses():

    print("Fetching businesses from OSM...")

    headers = {
        "User-Agent": "density-script/1.0"
    }

    response = requests.post(
        OVERPASS_URL,
        data={"data": QUERY},
        headers=headers,
        timeout=60
    )

    if response.status_code != 200:
        print(response.text[:300])
        return []

    data = response.json()

    businesses = []

    for element in data["elements"]:

        if "lat" in element:

            businesses.append({
                "lat": element["lat"],
                "lng": element["lon"]
            })

    print("Fetched:", len(businesses))

    return businesses


# -------------------------
# STEP 2 — GENERATE GRID
# -------------------------

def generate_grid():

    zones = []

    lat = LAT_MIN
    row = 0

    while lat < LAT_MAX:

        lng = LNG_MIN
        col = 0

        while lng < LNG_MAX:

            zone = {
                "zone_id": f"ZONE_{row}_{col}",

                "bounds": {
                    "south": lat,
                    "north": lat + CELL_SIZE,
                    "west": lng,
                    "east": lng + CELL_SIZE
                },

                "business_count": 0
            }

            zones.append(zone)

            col += 1
            lng += CELL_SIZE

        row += 1
        lat += CELL_SIZE

    print("Total zones:", len(zones))

    return zones


# -------------------------
# STEP 3 — FIND ZONE FOR BUSINESS
# -------------------------

def find_zone(lat, lng, zones):

    for zone in zones:

        b = zone["bounds"]

        if (
            b["south"] <= lat <= b["north"]
            and
            b["west"] <= lng <= b["east"]
        ):
            return zone

    return None


# -------------------------
# STEP 4 — ASSIGN BUSINESSES
# -------------------------

def assign_businesses_to_zones(businesses, zones):

    assigned = 0

    for biz in businesses:

        zone = find_zone(
            biz["lat"],
            biz["lng"],
            zones
        )

        if zone:

            zone["business_count"] += 1
            assigned += 1

    print("Assigned businesses:", assigned)


# -------------------------
# STEP 5 — SAVE RESULT
# -------------------------

def save_zones(zones):

    with open(OUTPUT_FILE, "w") as f:

        json.dump(
            zones,
            f,
            indent=2
        )

    print("Saved to", OUTPUT_FILE)


# -------------------------
# MAIN
# -------------------------

if __name__ == "__main__":

    businesses = fetch_osm_businesses()

    zones = generate_grid()

    assign_businesses_to_zones(
        businesses,
        zones
    )

    save_zones(zones)