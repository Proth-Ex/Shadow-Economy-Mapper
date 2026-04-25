"""
state.py — Shared application state for the Shadow Economy Mapper API.

Centralizes global state so route modules can import it
without circular dependencies.
"""

from typing import List, Dict
from datetime import datetime

# ── Grid cell data ──────────────────────────────────────────────────────
PROCESSED_CELLS: List[dict] = []
CELL_INDEX: Dict[str, dict] = {}  # cell_id -> cell

# ── Pipeline metadata ──────────────────────────────────────────────────
PIPELINE_STATUS: Dict = {
    "status": "idle",        # idle | running | completed | error
    "last_run": None,        # ISO timestamp of last successful run
    "cell_count": 0,
    "error": None,
}


def update_cells(cells: List[dict]) -> None:
    """Replace the global cell data and rebuild the index."""
    global PROCESSED_CELLS, CELL_INDEX
    PROCESSED_CELLS.clear()
    PROCESSED_CELLS.extend(cells)
    CELL_INDEX.clear()
    CELL_INDEX.update({c["cell_id"]: c for c in cells})
    PIPELINE_STATUS["cell_count"] = len(cells)


def mark_pipeline(status: str, error: str = None) -> None:
    """Update pipeline run status."""
    PIPELINE_STATUS["status"] = status
    PIPELINE_STATUS["error"] = error
    if status == "completed":
        PIPELINE_STATUS["last_run"] = datetime.utcnow().isoformat() + "Z"
