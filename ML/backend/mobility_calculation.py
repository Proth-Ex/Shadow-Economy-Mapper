import requests
import json
import statistics
import os


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

LAT_MIN = 14.88
LAT_MAX = 15.80

LNG_MIN = 73.68
LNG_MAX = 74.33

CELL_SIZE = 0.045   # ~5km grid

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "mobility.json")

# --------------------------------------------------
# STEP 1 — FETCH ROADS
# --------------------------------------------------

def fetch_roads():

    print("Fetching roads from OSM (this may take 15-30 seconds)...")

    query = """
    [out:json][timeout:90];
    area["name"="Goa"]->.searchArea;

    (
      way["highway"~"primary|secondary|tertiary|residential|unclassified"](area.searchArea);
    );

    out geom;
    """

    response = requests.post(
        OVERPASS_URL,
        data={"data": query},
        headers={"User-Agent": "shadow-economy-mapper"}
    )

    data = response.json()

    roads = []

    for element in data["elements"]:
        if element["type"] == "way" and "geometry" in element:
            roads.append({
                "nodes": [
                    {"lat": pt["lat"], "lng": pt["lon"]}
                    for pt in element["geometry"]
                ]
            })

    print("Roads fetched:", len(roads))

    return roads


# --------------------------------------------------
# STEP 2 — GENERATE GRID
# --------------------------------------------------

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

                "center_lat": lat + CELL_SIZE / 2,
                "center_lng": lng + CELL_SIZE / 2,

                "road_count": 0,
                "mobility_score": 0
            }

            zones.append(zone)

            col += 1
            lng += CELL_SIZE

        row += 1
        lat += CELL_SIZE

    print("Total zones:", len(zones))

    return zones


# --------------------------------------------------
# STEP 3 — CHECK POINT IN ZONE
# --------------------------------------------------

def point_in_zone(lat, lng, zone):

    b = zone["bounds"]

    return (
        b["south"] <= lat <= b["north"]
        and
        b["west"] <= lng <= b["east"]
    )


# --------------------------------------------------
# STEP 4 — ASSIGN ROADS TO ZONES
# --------------------------------------------------

def assign_roads_to_zones(roads, zones):

    print("Assigning roads to zones...")

    for road in roads:
        # Track which zones this road has already been counted in
        # so one long road doesn't inflate a zone's count multiple times
        counted_zones = set()

        for node in road["nodes"]:
            for zone in zones:
                zid = zone["zone_id"]

                if zid not in counted_zones and point_in_zone(
                    node["lat"], node["lng"], zone
                ):
                    zone["road_count"] += 1
                    counted_zones.add(zid)

    print("Road assignment done.")


# --------------------------------------------------
# STEP 5 — COMPUTE MOBILITY SCORE
# --------------------------------------------------

def compute_mobility(zones):

    print("Computing mobility score...")

    counts = [z["road_count"] for z in zones if z["road_count"] > 0]

    if not counts:
        print("No roads found.")
        return

    mean = statistics.mean(counts)
    max_count = max(counts)

    print("Average roads per zone:", round(mean, 2))
    print("Max roads in a zone:", max_count)

    for zone in zones:
        count = zone["road_count"]
        zone["mobility_score"] = round(count / max_count, 3) if max_count > 0 else 0


# --------------------------------------------------
# STEP 6 — SAVE JSON
# --------------------------------------------------

def save_output(zones):

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding='utf-8') as f:
        json.dump(zones, f, indent=2)

    print("Saved to", OUTPUT_FILE)


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    roads = fetch_roads()

    zones = generate_grid()

    assign_roads_to_zones(roads, zones)

    compute_mobility(zones)

    save_output(zones)

    print("\nDone. Sample output:")
    for zone in zones[:3]:
        print(f"  {zone['zone_id']} | road_count: {zone['road_count']}, mobility_score: {zone['mobility_score']}")