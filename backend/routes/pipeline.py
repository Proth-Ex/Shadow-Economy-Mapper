"""
routes/pipeline.py — ML pipeline management endpoints.

POST /api/pipeline/run    → trigger a fresh pipeline run
GET  /api/pipeline/status → pipeline run status and metadata
"""

import json
import os

from fastapi import APIRouter, BackgroundTasks

from data_loader import load_real_data
from ml_pipeline import run_pipeline
from state import PIPELINE_STATUS, update_cells, mark_pipeline

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(_BACKEND_DIR, "data", "processed_cells.json")


def _run_pipeline_task():
    """Background task: reload data, run ML pipeline, persist results."""
    try:
        mark_pipeline("running")
        raw_cells = load_real_data()
        processed = run_pipeline(raw_cells)

        # Persist to disk
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        with open(DATA_PATH, "w") as f:
            json.dump(processed, f, indent=2)

        update_cells(processed)
        mark_pipeline("completed")
        print(f"Pipeline re-run complete — {len(processed)} cells processed")

    except Exception as e:
        mark_pipeline("error", str(e))
        print(f"Pipeline re-run failed: {e}")


@router.post("/run")
async def run_pipeline_endpoint(background_tasks: BackgroundTasks):
    """Trigger a fresh ML pipeline run in the background."""
    if PIPELINE_STATUS["status"] == "running":
        return {"message": "Pipeline is already running", "status": PIPELINE_STATUS}

    background_tasks.add_task(_run_pipeline_task)
    return {"message": "Pipeline run started", "status": "running"}


@router.get("/status")
async def get_pipeline_status():
    """Return current pipeline status and metadata."""
    return PIPELINE_STATUS
