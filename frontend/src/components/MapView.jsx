import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const ARCHETYPE_COLORS = {
  'Shadow Economy Zone': '#ff4444',
  'Formal Urban Hub': '#4488ff',
  'Residential Dense': '#44bb88',
  'Transit Corridor': '#ffaa33',
  'Normal': '#555555',
}

function scoreToColor(score) {
  // Green -> Yellow -> Orange -> Red gradient
  if (score < 0.25) {
    const t = score / 0.25
    const r = Math.round(16 + t * (245 - 16))
    const g = Math.round(185 - t * (185 - 158))
    const b = Math.round(129 - t * (129 - 11))
    return `rgb(${r},${g},${b})`
  } else if (score < 0.5) {
    const t = (score - 0.25) / 0.25
    const r = Math.round(245 + t * (249 - 245))
    const g = Math.round(158 - t * (158 - 115))
    const b = Math.round(11 + t * (22 - 11))
    return `rgb(${r},${g},${b})`
  } else if (score < 0.75) {
    const t = (score - 0.5) / 0.25
    const r = Math.round(249 - t * (249 - 239))
    const g = Math.round(115 - t * (115 - 68))
    const b = Math.round(22 + t * (68 - 22))
    return `rgb(${r},${g},${b})`
  } else {
    const t = (score - 0.75) / 0.25
    const r = Math.round(239 + t * (220 - 239))
    const g = Math.round(68 - t * (68 - 38))
    const b = Math.round(68 + t * (38 - 68))
    return `rgb(${r},${g},${b})`
  }
}

function getCellColor(cell, colorMode) {
  if (colorMode === 'archetype') {
    return ARCHETYPE_COLORS[cell.archetype] || '#555555'
  }
  return scoreToColor(cell.shadow_score || 0)
}

function getCellOpacity(cell) {
  if (cell.anomaly_flag === -1) return 0.7
  // Non-anomalous: lower opacity but still visible
  return 0.25 + (cell.shadow_score || 0) * 0.3
}

function GridCell({ cell, isSelected, onClick, colorMode }) {
  const color = getCellColor(cell, colorMode)
  const opacity = getCellOpacity(cell)
  const bounds = [
    [cell.bounds.south, cell.bounds.west],
    [cell.bounds.north, cell.bounds.east],
  ]

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: isSelected ? '#00d4ff' : color,
        weight: isSelected ? 2 : 0.5,
        fillColor: color,
        fillOpacity: isSelected ? 0.85 : opacity,
        opacity: isSelected ? 1 : 0.6,
      }}
      eventHandlers={{
        click: () => onClick(cell),
      }}
    />
  )
}

function FitBounds({ cells }) {
  const map = useMap()
  const fitted = useRef(false)
  
  useEffect(() => {
    if (cells.length > 0 && !fitted.current) {
      const lats = cells.map(c => c.lat)
      const lngs = cells.map(c => c.lng)
      const bounds = [
        [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
        [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02],
      ]
      map.fitBounds(bounds, { padding: [20, 20] })
      fitted.current = true
    }
  }, [cells, map])

  return null
}

export default function MapView({ cells, selectedCell, onCellClick, colorMode }) {
  return (
    <MapContainer
      center={[15.35, 74.05]}
      zoom={10}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={18}
      />
      <FitBounds cells={cells} />
      {cells.map(cell => (
        <GridCell
          key={cell.cell_id}
          cell={cell}
          isSelected={selectedCell?.cell_id === cell.cell_id}
          onClick={onCellClick}
          colorMode={colorMode}
        />
      ))}
    </MapContainer>
  )
}
