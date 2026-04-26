import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

/**
 * HeatmapLayer — renders a Leaflet.heat overlay from cell data.
 * Uses shadow_score as the intensity value at each cell's center.
 */
export default function HeatmapLayer({ cells, field = 'shadow_score' }) {
  const map = useMap()

  useEffect(() => {
    if (!cells || cells.length === 0) return

    // Build heat points: [lat, lng, intensity]
    const points = cells.map(cell => [
      cell.lat,
      cell.lng,
      cell[field] || 0,
    ])

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 14,
      max: 1.0,
      minOpacity: 0.35,
      gradient: {
        0.0: '#0d1b2a',
        0.2: '#1b4332',
        0.4: '#2d6a4f',
        0.5: '#f59e0b',
        0.65: '#f97316',
        0.8: '#ef4444',
        1.0: '#dc2626',
      },
    })

    heat.addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [cells, field, map])

  return null
}
