import React, { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet'
import { fetchZones } from '../services/api'

// ── Colour map ────────────────────────────────────────────────
const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

// ── Helper: fly to zone ────────────────────────────────────────
function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords?.length) {
      const lats = coords.map(c => c[0])
      const lngs = coords.map(c => c[1])
      const center = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2
      ]
      map.flyTo(center, 14, { duration: 1.2 })
    }
  }, [coords, map])
  return null
}

// ── Zone sidebar card ─────────────────────────────────────────
function ZoneCard({ zone, selected, onClick }) {
  return (
    <div
      className={`zone-card${selected ? ' selected' : ''}`}
      onClick={() => onClick(zone)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="zone-card-name">{zone.name}</div>
        <span className={`badge ${zone.riskLevel}`}>
          {zone.riskLevel === 'high' ? '🔴' : zone.riskLevel === 'medium' ? '🟡' : '🟢'}
          {zone.riskLevel}
        </span>
      </div>
      <div className="zone-card-meta">{zone.description}</div>
      <div className="zone-card-stat">
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agents</div>
          <div className="zone-stat-val">{zone.activeAgents.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Turnover</div>
          <div className="zone-stat-val">₹{(zone.estimatedTurnover / 100000).toFixed(1)}L</div>
        </div>
      </div>
    </div>
  )
}

// ── Main Map Page ─────────────────────────────────────────────
export default function MapPage() {
  const [zones, setZones]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [flyCoords, setFlyCoords] = useState(null)

  useEffect(() => {
    fetchZones()
      .then(res => { setZones(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleZoneClick = useCallback((zone) => {
    setSelected(zone.id)
    setFlyCoords(zone.coordinates)
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner" />
          Loading shadow economy zones…
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ padding: 20, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <div className="map-layout">
        {/* ── Map ── */}
        <div className="map-container">
          <MapContainer
            center={[15.4909, 73.8278]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flyCoords && <FlyTo coords={flyCoords} />}
            {zones.map(zone => (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color:       RISK_COLORS[zone.riskLevel],
                  fillColor:   RISK_COLORS[zone.riskLevel],
                  fillOpacity: selected === zone.id ? 0.55 : 0.28,
                  weight:      selected === zone.id ? 3 : 1.5,
                  dashArray:   zone.riskLevel === 'low' ? '6,4' : undefined,
                }}
                eventHandlers={{ click: () => handleZoneClick(zone) }}
              >
                <Popup>
                  <div className="popup-title">{zone.name}</div>
                  <div className="popup-row">Risk: <span>{zone.riskLevel.toUpperCase()}</span></div>
                  <div className="popup-row">Category: <span>{zone.category.replace(/_/g, ' ')}</span></div>
                  <div className="popup-row">Active Agents: <span>{zone.activeAgents}</span></div>
                  <div className="popup-row">Est. Turnover: <span>₹{(zone.estimatedTurnover / 100000).toFixed(1)}L</span></div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
        </div>

        {/* ── Zone List ── */}
        <div className="map-sidebar">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">Shadow Economy Zones · Goa</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              {zones.length} active zones · Click to fly to location
            </p>
          </div>
          {zones.map(zone => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              selected={selected === zone.id}
              onClick={handleZoneClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
