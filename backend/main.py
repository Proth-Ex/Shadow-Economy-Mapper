"""
main.py — FastAPI backend for Shadow Economy Mapper.

Serves processed grid cell data via REST API.
Runs the ML pipeline on startup.

Routes are organized into modular files under routes/.
"""

import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_real_data
from ml_pipeline import run_pipeline
from state import update_cells, mark_pipeline

# ── Route imports ──────────────────────────────────────────────────────
from routes.cells import router as cells_router
from routes.stats import router as stats_router
from routes.archetypes import router as archetypes_router
from routes.pipeline import router as pipeline_router
from routes.health import router as health_router


# ── Lifespan ───────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app):
    """Load data and run ML pipeline on server startup."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "processed_cells.json")

    if os.path.exists(data_path):
        print(f"Loading pre-processed data from {data_path}")
        with open(data_path, "r") as f:
            cells = json.load(f)
    else:
        print("No pre-processed data found. Loading real data and running pipeline...")
        raw_cells = load_real_data()
        cells = run_pipeline(raw_cells)
        # Save for next time
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, "w") as f:
            json.dump(cells, f, indent=2)
        print(f"Saved processed data to {data_path}")

    update_cells(cells)
    mark_pipeline("completed")
    print(f"Loaded {len(cells)} cells. Server ready.")
    yield


# ── App setup ──────────────────────────────────────────────────────────

app = FastAPI(
    title="Shadow Economy Mapper API",
    description="Geospatial intelligence API for estimating informal economic activity in Goa",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Vite dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register routers ──────────────────────────────────────────────────

app.include_router(cells_router)
app.include_router(stats_router)
app.include_router(archetypes_router)
app.include_router(pipeline_router)
app.include_router(health_router)


# ── Entry point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
