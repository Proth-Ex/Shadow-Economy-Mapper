"""
main.py — FastAPI backend for Shadow Economy Mapper.

Serves processed grid cell data via REST API.
Runs the ML pipeline on startup.
"""

import json
import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_real_data
from ml_pipeline import run_pipeline, ARCHETYPE_COLORS

# Global state
PROCESSED_CELLS: List[dict] = []
CELL_INDEX: dict = {}  # cell_id -> cell


@asynccontextmanager
async def lifespan(app):
    """Generate data and run ML pipeline on server startup."""
    global PROCESSED_CELLS, CELL_INDEX

    data_path = os.path.join(os.path.dirname(__file__), "data", "processed_cells.json")

    if os.path.exists(data_path):
        print(f"Loading pre-processed data from {data_path}")
        with open(data_path, "r") as f:
            PROCESSED_CELLS = json.load(f)
    else:
        print("No pre-processed data found. Loading real data and running pipeline...")
        raw_cells = load_real_data()
        PROCESSED_CELLS = run_pipeline(raw_cells)
        # Save for next time
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, "w") as f:
            json.dump(PROCESSED_CELLS, f, indent=2)
        print(f"Saved processed data to {data_path}")

    CELL_INDEX.update({c["cell_id"]: c for c in PROCESSED_CELLS})
    print(f"Loaded {len(PROCESSED_CELLS)} cells. Server ready.")
    yield


app = FastAPI(
    title="Shadow Economy Mapper API",
    description="Geospatial intelligence API for estimating informal economic activity in Goa",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — pinned to Vite's default port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/cells")
async def get_cells(
    archetype: Optional[str] = Query(None, description="Filter by archetype"),
    confidence: Optional[str] = Query(None, description="Filter by confidence level"),
    min_score: Optional[float] = Query(None, description="Minimum shadow score"),
    anomalous_only: Optional[bool] = Query(False, description="Only return anomalous cells"),
):
    """Return all processed grid cells with optional filters."""
    result = PROCESSED_CELLS

    if archetype:
        result = [c for c in result if c.get("archetype") == archetype]

    if confidence:
        result = [c for c in result if c.get("confidence") == confidence]

    if min_score is not None:
        result = [c for c in result if c.get("shadow_score", 0) >= min_score]

    if anomalous_only:
        result = [c for c in result if c.get("anomaly_flag") == -1]

    return {"cells": result, "total": len(result)}


@app.get("/api/cells/{cell_id}")
async def get_cell(cell_id: str):
    """Return a single cell by ID."""
    cell = CELL_INDEX.get(cell_id)
    if cell is None:
        return {"error": f"Cell {cell_id} not found"}
    return cell


@app.get("/api/stats")
async def get_stats():
    """Return summary statistics."""
    total = len(PROCESSED_CELLS)
    anomalous = sum(1 for c in PROCESSED_CELLS if c.get("anomaly_flag") == -1)

    # Archetype distribution
    archetype_counts = {}
    for c in PROCESSED_CELLS:
        arch = c.get("archetype", "Unknown")
        archetype_counts[arch] = archetype_counts.get(arch, 0) + 1

    # Confidence distribution
    confidence_counts = {}
    for c in PROCESSED_CELLS:
        conf = c.get("confidence", "unknown")
        confidence_counts[conf] = confidence_counts.get(conf, 0) + 1

    # Average shadow score
    scores = [c.get("shadow_score", 0) for c in PROCESSED_CELLS]
    avg_score = sum(scores) / len(scores) if scores else 0

    # Top hotspots (highest shadow_score anomalous cells)
    hotspots = sorted(
        [c for c in PROCESSED_CELLS if c.get("anomaly_flag") == -1],
        key=lambda c: c.get("shadow_score", 0),
        reverse=True,
    )[:10]

    return {
        "total_cells": total,
        "anomalous_cells": anomalous,
        "anomalous_pct": round(anomalous / total * 100, 1) if total > 0 else 0,
        "avg_shadow_score": round(avg_score, 4),
        "archetype_distribution": archetype_counts,
        "confidence_distribution": confidence_counts,
        "top_hotspots": hotspots,
    }


@app.get("/api/archetypes")
async def get_archetypes():
    """Return archetype definitions and colors."""
    return {
        "archetypes": [
            {
                "name": "Shadow Economy Zone",
                "color": ARCHETYPE_COLORS["Shadow Economy Zone"],
                "description": "High light + high population + low formal presence — strong informal economy signal",
            },
            {
                "name": "Formal Urban Hub",
                "color": ARCHETYPE_COLORS["Formal Urban Hub"],
                "description": "High formal business density + high light — established commercial centers",
            },
            {
                "name": "Residential Dense",
                "color": ARCHETYPE_COLORS["Residential Dense"],
                "description": "High population but low formal and mobility — residential neighborhoods",
            },
            {
                "name": "Transit Corridor",
                "color": ARCHETYPE_COLORS["Transit Corridor"],
                "description": "High mobility with moderate other signals — major road corridors",
            },
            {
                "name": "Normal",
                "color": ARCHETYPE_COLORS["Normal"],
                "description": "Non-anomalous cell — typical signal patterns",
            },
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

