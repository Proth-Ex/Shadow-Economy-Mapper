"""
routes/cells.py — Grid cell endpoints.

GET /api/cells          → list all cells with optional filters
GET /api/cells/{cell_id} → single cell by ID
"""

from typing import Optional

from fastapi import APIRouter, Query, HTTPException

from state import PROCESSED_CELLS, CELL_INDEX

router = APIRouter(prefix="/api/cells", tags=["cells"])


@router.get("")
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


@router.get("/{cell_id}")
async def get_cell(cell_id: str):
    """Return a single cell by ID."""
    cell = CELL_INDEX.get(cell_id)
    if cell is None:
        raise HTTPException(status_code=404, detail=f"Cell {cell_id} not found")
    return cell
