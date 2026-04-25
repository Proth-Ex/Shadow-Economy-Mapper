import ee
import json

# --------------------------------------------------
# INITIALIZE EARTH ENGINE
# --------------------------------------------------

ee.Initialize(project="intense-nexus-494413-t1")

# --------------------------------------------------
# CONFIG — SAME BOUNDARY + GRID SIZE
# --------------------------------------------------

LAT_MIN = 14.88
LAT_MAX = 15.80

LNG_MIN = 73.68
LNG_MAX = 74.33

CELL_SIZE = 0.045   # 5 km grid

OUTPUT_FILE = "./data/light_intensity_zones.json"

# VIIRS dataset

DATASET = (
    ee.ImageCollection(
        "NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG"
    )
    .filterDate(
        "2023-01-01",
        "2023-12-31"
    )
    .select("avg_rad")
    .mean()
)

# --------------------------------------------------
# STEP 1 — GENERATE GRID
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
                    lng + CELL_SIZE / 2
            }

            zones.append(zone)

            col += 1
            lng += CELL_SIZE

        row += 1
        lat += CELL_SIZE

    print("Total zones:", len(zones))

    return zones


# --------------------------------------------------
# STEP 2 — FETCH LIGHT INTENSITY FOR ALL ZONES
# --------------------------------------------------

def get_light_intensity(zones):

    print("Fetching light intensity from GEE...")

    features = []

    for zone in zones:

        b = zone["bounds"]

        rectangle = ee.Geometry.Rectangle([
            b["west"],
            b["south"],
            b["east"],
            b["north"]
        ])

        feature = ee.Feature(rectangle)

        features.append(feature)

    feature_collection = ee.FeatureCollection(
        features
    )

    result = DATASET.reduceRegions(

        collection=feature_collection,

        reducer=ee.Reducer.mean(),

        scale=500

    )

    data = result.getInfo()

    for i, feature in enumerate(data["features"]):

        value = feature["properties"].get(
            "mean"
        )

        if value is None:

            value = 0

        zones[i]["light_intensity"] = round(
            value,
            3
        )

    print("Light intensity assigned")


# --------------------------------------------------
# STEP 3 — OPTIONAL NORMALIZATION (0–1)
# --------------------------------------------------

def normalize_intensity(zones):

    values = [
        z["light_intensity"]
        for z in zones
    ]

    max_val = max(values)

    if max_val == 0:

        return

    for zone in zones:

        norm = zone["light_intensity"] / max_val

        zone["light_score"] = round(
            norm,
            3
        )


# --------------------------------------------------
# STEP 4 — SAVE JSON
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

    zones = generate_grid()

    get_light_intensity(
        zones
    )

    normalize_intensity(
        zones
    )

    save_output(
        zones
    )