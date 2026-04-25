import requests
import json
import statistics

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

LAT_MIN = 14.88
LAT_MAX = 15.80

LNG_MIN = 73.68
LNG_MAX = 74.33

CELL_SIZE = 0.045   # 5 km grid

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OUTPUT_FILE = "zones_with_density.json"


# --------------------------------------------------
# STEP 1 — FETCH BUSINESSES
# --------------------------------------------------

def fetch_businesses():

    print("Fetching businesses from OSM...")

    query = """
    [out:json][timeout:25];
    area["name"="Goa"]->.searchArea;

    (
      node["shop"](area.searchArea);
      node["office"](area.searchArea);
      node["amenity"="restaurant"](area.searchArea);
    );

    out body;
    """

    response = requests.post(
        OVERPASS_URL,
        data={"data": query},
        headers={"User-Agent": "density-script"}
    )

    data = response.json()

    businesses = []

    for element in data["elements"]:

        if "lat" in element:

            businesses.append({
                "lat": element["lat"],
                "lng": element["lon"]
            })

    print("Businesses fetched:", len(businesses))

    return businesses


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

                "center_lat":
                    lat + CELL_SIZE / 2,

                "center_lng":
                    lng + CELL_SIZE / 2,

                "business_count": 0,

                "density": 0
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
# STEP 4 — ASSIGN BUSINESSES
# --------------------------------------------------

def assign_businesses_to_zones(businesses, zones):

    assigned = 0

    for biz in businesses:

        for zone in zones:

            if point_in_zone(

                biz["lat"],
                biz["lng"],
                zone

            ):

                zone["business_count"] += 1

                assigned += 1

                break

    print("Businesses assigned:", assigned)


# --------------------------------------------------
# STEP 5 — COMPUTE DENSITY
# --------------------------------------------------

def compute_density(zones):

    print("Computing density...")

    counts = [

        z["business_count"]

        for z in zones

        if z["business_count"] > 0

    ]

    if not counts:

        print("No businesses found.")

        return

    mean = statistics.mean(counts)

    print("Average businesses per zone:", round(mean, 2))

    for zone in zones:

        count = zone["business_count"]

        if mean > 0:

            density = count / mean

        else:

            density = 0

        zone["density"] = round(
            density,
            3
        )


# --------------------------------------------------
# STEP 6 — SAVE JSON
# --------------------------------------------------

def save_output(zones):

    with open(

        OUTPUT_FILE,

        "w"

    ) as f:

        json.dump(

            zones,

            f,

            indent=2

        )

    print("Saved to", OUTPUT_FILE)


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    businesses = fetch_businesses()

    zones = generate_grid()

    assign_businesses_to_zones(

        businesses,

        zones

    )

    compute_density(

        zones

    )

    save_output(

        zones

    )