import { useState, useEffect } from 'react'
import './StatsPage.css'

const API_BASE = import.meta.env.VITE_API_URL;

const ARCHETYPE_COLORS = {
  'Shadow Economy Zone': '#ff4444',
  'Formal Urban Hub': '#4488ff',
  'Residential Dense': '#44bb88',
  'Transit Corridor': '#ffaa33',
  'Normal': '#666666',
}

const SIGNAL_COLORS = {
  light_score: '#f59e0b',
  population_density: '#8b5cf6',
  mobility_score: '#06b6d4',
  registered_density: '#3b82f6',
}

function getScoreColor(score) {
  if (score >= 0.7) return 'var(--color-shadow)'
  if (score >= 0.4) return 'var(--color-transit)'
  return 'var(--score-low)'
}

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [signals, setSignals] = useState(null)
  const [distribution, setDistribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true)
        const [statsRes, signalsRes, distRes] = await Promise.all([
          fetch(`${API_BASE}/api/stats`),
          fetch(`${API_BASE}/api/stats/signals`),
          fetch(`${API_BASE}/api/stats/distribution`),
        ])

        if (!statsRes.ok || !signalsRes.ok || !distRes.ok)
          throw new Error('API request failed')

        setStats(await statsRes.json())
        setSignals(await signalsRes.json())
        setDistribution(await distRes.json())
        setError(null)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Failed to connect to backend.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="loading-spinner" />
          <div className="loading-text">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div className="loading-text">{error}</div>
        </div>
      </div>
    )
  }

  const maxArchCount = Math.max(
    ...Object.values(stats.archetype_distribution || {})
  )
  const maxHistCount = Math.max(
    ...(distribution?.histogram || []).map((b) => b.count),
    1
  )
  const totalCells = stats.total_cells || 1
  const confDist = stats.confidence_distribution || {}
  const maxConf = Math.max(...Object.values(confDist), 1)

  return (
    <div className="stats-page">
      {/* Page Header */}
      <div className="stats-page-header">
        <h1>📊 ANALYTICS DASHBOARD</h1>
        <p>
          Shadow Economy Intelligence — {stats.total_cells} grid cells analyzed
        </p>
      </div>

      {/* Hero Metrics */}
      <div className="hero-metrics">
        <div className="hero-card glass-panel">
          <div className="hero-value cyan">{stats.total_cells}</div>
          <div className="hero-label">Grid Cells</div>
        </div>
        <div className="hero-card glass-panel">
          <div className="hero-value red">{stats.anomalous_cells}</div>
          <div className="hero-label">Anomalous Cells</div>
        </div>
        <div className="hero-card glass-panel">
          <div className="hero-value amber">{stats.anomalous_pct}%</div>
          <div className="hero-label">Detection Rate</div>
        </div>
        <div className="hero-card glass-panel">
          <div className="hero-value green">
            {(stats.avg_shadow_score * 100).toFixed(1)}
          </div>
          <div className="hero-label">Avg Shadow Score</div>
        </div>
      </div>

      {/* Two-Column: Archetype Breakdown + Score Distribution */}
      <div className="stats-grid-2col">
        {/* Archetype Breakdown */}
        <div className="stats-section glass-panel">
          <div className="stats-section-title">
            <span className="section-icon">🏷️</span>
            Archetype Distribution
          </div>
          {Object.entries(stats.archetype_distribution || {}).map(
            ([name, count]) => (
              <div className="archetype-bar-row" key={name}>
                <div className="archetype-bar-label">
                  <span
                    className="archetype-dot"
                    style={{
                      background: ARCHETYPE_COLORS[name] || '#666',
                    }}
                  />
                  <span>{name}</span>
                </div>
                <div className="archetype-bar-track">
                  <div
                    className="archetype-bar-fill"
                    style={{
                      width: `${(count / maxArchCount) * 100}%`,
                      background: ARCHETYPE_COLORS[name] || '#666',
                    }}
                  />
                </div>
                <span className="archetype-bar-count">{count}</span>
              </div>
            )
          )}
        </div>

        {/* Score Histogram */}
        <div className="stats-section glass-panel">
          <div className="stats-section-title">
            <span className="section-icon">📈</span>
            Shadow Score Distribution
          </div>
          <div className="histogram">
            {(distribution?.histogram || []).map((bin, i) => {
              const pct = (bin.count / maxHistCount) * 100
              const hue = 120 - (i / 9) * 120 // green -> red
              return (
                <div className="histogram-bar-wrapper" key={bin.bin}>
                  <div className="histogram-count">{bin.count}</div>
                  <div className="histogram-bar-container">
                    <div
                      className="histogram-bar"
                      style={{
                        height: `${Math.max(pct, 2)}%`,
                        background: `hsl(${hue}, 70%, 50%)`,
                      }}
                      title={`${bin.bin}: ${bin.count} cells`}
                    />
                  </div>
                  <div className="histogram-label">{bin.bin}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two-Column: Signal Analysis + Confidence */}
      <div className="stats-grid-2col">
        {/* Signal Analysis */}
        <div className="stats-section glass-panel">
          <div className="stats-section-title">
            <span className="section-icon">📡</span>
            Signal Analysis
          </div>
          <div className="signal-cards">
            {(signals?.signals || []).map((sig) => (
              <div className="signal-stat-card" key={sig.key}>
                <div
                  className="signal-stat-name"
                  style={{ color: SIGNAL_COLORS[sig.key] }}
                >
                  {sig.label}
                </div>
                <div className="signal-stat-grid">
                  <div className="signal-stat-item">
                    <span className="signal-stat-val">
                      {(sig.mean * 100).toFixed(1)}%
                    </span>
                    <span className="signal-stat-key">Mean</span>
                  </div>
                  <div className="signal-stat-item">
                    <span className="signal-stat-val">
                      {(sig.median * 100).toFixed(1)}%
                    </span>
                    <span className="signal-stat-key">Median</span>
                  </div>
                  <div className="signal-stat-item">
                    <span className="signal-stat-val">
                      {(sig.max * 100).toFixed(1)}%
                    </span>
                    <span className="signal-stat-key">Max</span>
                  </div>
                  <div className="signal-stat-item">
                    <span className="signal-stat-val">
                      {sig.non_zero_count}/{sig.total_count}
                    </span>
                    <span className="signal-stat-key">Non-Zero</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="stats-section glass-panel">
          <div className="stats-section-title">
            <span className="section-icon">🎯</span>
            Confidence Distribution
          </div>
          <div className="confidence-bars">
            {['high', 'medium', 'low'].map((level) => {
              const count = confDist[level] || 0
              return (
                <div className="confidence-row" key={level}>
                  <span className={`confidence-label ${level}`}>{level}</span>
                  <div className="confidence-track">
                    <div
                      className={`confidence-fill ${level}`}
                      style={{ width: `${(count / totalCells) * 100}%` }}
                    />
                  </div>
                  <span className="confidence-count">
                    {count}{' '}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      ({((count / totalCells) * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Archetype Avg Scores */}
          {distribution?.archetypes && (
            <>
              <div
                className="stats-section-title"
                style={{ marginTop: 24 }}
              >
                <span className="section-icon">⚡</span>
                Archetype Avg Scores
              </div>
              {distribution.archetypes.map((arch) => (
                <div
                  key={arch.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: ARCHETYPE_COLORS[arch.name] || '#666',
                      }}
                    />
                    {arch.name}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: getScoreColor(arch.avg_score),
                    }}
                  >
                    {(arch.avg_score * 100).toFixed(1)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Top 10 Hotspots Table */}
      <div className="stats-section glass-panel" style={{ animation: 'fadeIn 0.5s ease 0.3s both' }}>
        <div className="stats-section-title">
          <span className="section-icon">🔥</span>
          Top 10 Shadow Economy Hotspots
        </div>
        <table className="hotspot-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cell ID</th>
              <th>Shadow Score</th>
              <th>Archetype</th>
              <th>Confidence</th>
              <th>Light</th>
              <th>Population</th>
              <th>Mobility</th>
              <th>Business</th>
            </tr>
          </thead>
          <tbody>
            {(stats.top_hotspots || []).map((cell, i) => (
              <tr key={cell.cell_id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {i + 1}
                </td>
                <td>
                  <a
                    href={`https://www.google.com/maps?q=${cell.lat},${cell.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hotspot-cell-id"
                    title={`Open ${cell.lat.toFixed(4)}°N, ${cell.lng.toFixed(4)}°E in Google Maps`}
                  >
                    {cell.cell_id} ↗
                  </a>
                </td>
                <td>
                  <span
                    className="hotspot-score"
                    style={{ color: getScoreColor(cell.shadow_score) }}
                  >
                    {(cell.shadow_score * 100).toFixed(1)}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge badge-${cell.archetype === 'Shadow Economy Zone'
                        ? 'shadow'
                        : cell.archetype === 'Formal Urban Hub'
                          ? 'formal'
                          : cell.archetype === 'Residential Dense'
                            ? 'residential'
                            : cell.archetype === 'Transit Corridor'
                              ? 'transit'
                              : 'normal'
                      }`}
                    style={{ fontSize: 10 }}
                  >
                    {cell.archetype}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${cell.confidence}`} style={{ fontSize: 10 }}>
                    {cell.confidence}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {(cell.light_score * 100).toFixed(0)}%
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {(cell.population_density * 100).toFixed(0)}%
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {(cell.mobility_score * 100).toFixed(0)}%
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {(cell.registered_density * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pipeline Badge */}
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
        <span className="pipeline-badge">
          <span className="pipeline-dot" />
          Real Data Pipeline • PCA + Isolation Forest + K-Means
        </span>
      </div>
    </div>
  )
}
