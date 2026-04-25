"""
routes/stats.py — Summary statistics endpoints.

GET /api/stats              → full statistics payload
GET /api/stats/overview     → condensed overview metrics only
GET /api/stats/signals      → per-signal aggregations (min, max, mean, median)
GET /api/stats/distribution → score histogram + archetype breakdown
"""

import statistics as st

from fastapi import APIRouter

from state import PROCESSED_CELLS

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
async def get_stats():
    """Return full summary statistics."""
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

    # Top hotspots (highest shadow_score Shadow Economy Zone cells)
    hotspots = sorted(
        [c for c in PROCESSED_CELLS
         if c.get("archetype") == "Shadow Economy Zone"],
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


@router.get("/overview")
async def get_stats_overview():
    """Return condensed overview metrics only."""
    total = len(PROCESSED_CELLS)
    anomalous = sum(1 for c in PROCESSED_CELLS if c.get("anomaly_flag") == -1)
    scores = [c.get("shadow_score", 0) for c in PROCESSED_CELLS]
    avg_score = sum(scores) / len(scores) if scores else 0

    return {
        "total_cells": total,
        "anomalous_cells": anomalous,
        "anomalous_pct": round(anomalous / total * 100, 1) if total > 0 else 0,
        "avg_shadow_score": round(avg_score, 4),
    }


SIGNAL_COLS = ["light_score", "registered_density", "population_density", "mobility_score"]
SIGNAL_LABELS = {
    "light_score": "VIIRS Nighttime Light",
    "registered_density": "OSM Business Density",
    "population_density": "Population Density",
    "mobility_score": "Road Mobility",
}


@router.get("/signals")
async def get_signal_stats():
    """Return per-signal aggregations (min, max, mean, median)."""
    if not PROCESSED_CELLS:
        return {"signals": []}

    result = []
    for col in SIGNAL_COLS:
        vals = [c.get(col, 0) for c in PROCESSED_CELLS]
        non_zero = sum(1 for v in vals if v > 0)
        result.append({
            "key": col,
            "label": SIGNAL_LABELS[col],
            "min": round(min(vals), 4),
            "max": round(max(vals), 4),
            "mean": round(st.mean(vals), 4),
            "median": round(st.median(vals), 4),
            "std_dev": round(st.stdev(vals), 4) if len(vals) > 1 else 0,
            "non_zero_count": non_zero,
            "total_count": len(vals),
        })
    return {"signals": result}


@router.get("/distribution")
async def get_distribution():
    """Return shadow score histogram (10 bins) + per-archetype avg scores."""
    if not PROCESSED_CELLS:
        return {"histogram": [], "archetypes": []}

    scores = [c.get("shadow_score", 0) for c in PROCESSED_CELLS]

    # 10-bin histogram
    num_bins = 10
    histogram = []
    for i in range(num_bins):
        low = i / num_bins
        high = (i + 1) / num_bins
        count = sum(1 for s in scores if low <= s < high) if i < num_bins - 1 \
            else sum(1 for s in scores if low <= s <= high)
        histogram.append({
            "bin": f"{low:.1f}-{high:.1f}",
            "low": round(low, 2),
            "high": round(high, 2),
            "count": count,
        })

    # Per-archetype breakdown
    arch_data = {}
    for c in PROCESSED_CELLS:
        arch = c.get("archetype", "Unknown")
        if arch not in arch_data:
            arch_data[arch] = {"scores": [], "count": 0}
        arch_data[arch]["scores"].append(c.get("shadow_score", 0))
        arch_data[arch]["count"] += 1

    archetypes = []
    for name, data in arch_data.items():
        archetypes.append({
            "name": name,
            "count": data["count"],
            "avg_score": round(st.mean(data["scores"]), 4),
            "max_score": round(max(data["scores"]), 4),
            "min_score": round(min(data["scores"]), 4),
        })

    # Sort by avg_score descending
    archetypes.sort(key=lambda a: a["avg_score"], reverse=True)

    return {"histogram": histogram, "archetypes": archetypes}

