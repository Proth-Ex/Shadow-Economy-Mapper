"""
routes/health.py — Health check endpoint.

GET /api/health → server status, timestamp, and cell count
"""

from datetime import datetime

from fastapi import APIRouter

from state import PROCESSED_CELLS, PIPELINE_STATUS

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """Return server health status."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cells_loaded": len(PROCESSED_CELLS),
        "pipeline": PIPELINE_STATUS["status"],
    }
