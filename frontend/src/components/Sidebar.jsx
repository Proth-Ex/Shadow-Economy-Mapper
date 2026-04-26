function getScoreColor(score) {
  if (score >= 0.7) return 'var(--color-shadow)'
  if (score >= 0.4) return 'var(--color-transit)'
  return 'var(--score-low)'
}

function getArchetypeBadgeClass(archetype) {
  const map = {
    'Shadow Economy Zone': 'badge-shadow',
    'Formal Urban Hub': 'badge-formal',
    'Residential Dense': 'badge-residential',
    'Transit Corridor': 'badge-transit',
    'Normal': 'badge-normal',
  }
  return map[archetype] || 'badge-normal'
}

function SignalBar({ name, value, color }) {
  return (
    <div className="signal-row">
      <span className="signal-name">{name}</span>
      <div className="signal-bar-track" style={{ flex: 1 }}>
        <div
          className="signal-bar-fill"
          style={{
            width: `${Math.round(value * 100)}%`,
            background: color || 'var(--accent-cyan)',
          }}
        />
      </div>
      <span className="signal-value">{(value * 100).toFixed(0)}%</span>
    </div>
  )
}

export default function Sidebar({ cell, onClose }) {
  if (!cell) return null

  const informalProbability = cell.informal_probability ?? cell.shadow_score
  const scoreColor = getScoreColor(informalProbability)

  return (
    <div className="sidebar glass-panel animate-slide-in">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-cell-id">{cell.cell_id}</span>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>

      {/* Archetype + Confidence badges */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className={`badge ${getArchetypeBadgeClass(cell.archetype)}`}>
          {cell.archetype}
        </span>
        <span className={`badge badge-${cell.confidence}`}>
          {cell.confidence} confidence
        </span>
        {cell.anomaly_flag === -1 && (
          <span className="badge badge-shadow">⚡ Anomalous</span>
        )}
      </div>

      {/* Informal Probability Gauge */}
      <div className="score-gauge">
        <div className="score-gauge-value" style={{ color: scoreColor }}>
          {(informalProbability * 100).toFixed(1)}
        </div>
        <div className="score-gauge-label">Informal Probability</div>
        <div style={{
          width: '100%',
          height: 4,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          marginTop: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${informalProbability * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--score-low), ${scoreColor})`,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Shadow Score */}
      {cell.shadow_score !== undefined && (
        <div style={{
          textAlign: 'center',
          marginBottom: 16,
          padding: '8px 0',
          borderBottom: '1px solid var(--border-glass)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Shadow Economy Index:{' '}
          </span>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: cell.shadow_score > 0.6 ? 'var(--color-shadow)' : 'var(--text-primary)',
          }}>
            {(cell.shadow_score * 100).toFixed(1)}
          </span>
        </div>
      )}

      {/* Proxy Signals */}
      <div className="signal-section">
        <div className="signal-section-title">Real Data Signals</div>
        <SignalBar name="VIIRS Light" value={cell.light_score} color="#f59e0b" />
        <SignalBar name="Census Pop." value={cell.population_density} color="#8b5cf6" />
        <SignalBar name="OSM Roads" value={cell.mobility_score} color="#06b6d4" />
        <SignalBar name="OSM Business" value={cell.registered_density} color="#3b82f6" />
      </div>

      {/* Anomaly Score */}
      {cell.anomaly_score !== undefined && (
        <div className="signal-section">
          <div className="signal-section-title">Anomaly Score</div>
          <SignalBar name="Deviation" value={cell.anomaly_score} color="var(--color-shadow)" />
        </div>
      )}

      {/* Coordinates */}
      <div className="coord-row">
        <div className="coord-item">
          <span className="coord-label">Latitude</span>
          <span className="coord-value">{cell.lat.toFixed(4)}°N</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">Longitude</span>
          <span className="coord-value">{cell.lng.toFixed(4)}°E</span>
        </div>
        <div className="coord-item">
          <span className="coord-label">Grid Size</span>
          <span className="coord-value">5km × 5km</span>
        </div>
      </div>
    </div>
  )
}
