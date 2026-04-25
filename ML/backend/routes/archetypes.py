"""
routes/archetypes.py — Archetype definition endpoints.

GET /api/archetypes → archetype names, colors, and descriptions
"""

from fastapi import APIRouter

from ml_pipeline import ARCHETYPE_COLORS

router = APIRouter(prefix="/api/archetypes", tags=["archetypes"])


@router.get("")
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
