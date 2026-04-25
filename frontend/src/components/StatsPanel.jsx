export default function StatsPanel({ stats }) {
  if (!stats) return null

  return (
    <div className="stats-panel glass-panel">
      <div className="stats-grid">
        <div className="stat-item animate-fade-in">
          <span className="stat-value cyan">{stats.total_cells}</span>
          <span className="stat-label">Grid Cells</span>
        </div>
        <div className="stat-item animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="stat-value red">{stats.anomalous_cells}</span>
          <span className="stat-label">Anomalous</span>
        </div>
        <div className="stat-item animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="stat-value amber">{stats.anomalous_pct}%</span>
          <span className="stat-label">Detection Rate</span>
        </div>
        <div className="stat-item animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <span className="stat-value green">
            {(stats.avg_shadow_score * 100).toFixed(0)}
          </span>
          <span className="stat-label">Avg Score</span>
        </div>
      </div>

      {/* Archetype mini breakdown */}
      {stats.archetype_distribution && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-glass)' }}>
          {Object.entries(stats.archetype_distribution)
            .filter(([name]) => name !== 'Normal')
            .map(([name, count]) => (
              <div key={name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                color: 'var(--text-secondary)',
                marginBottom: 3,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: getArchetypeColor(name),
                  }} />
                  {name}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* Real Data Indicator */}
      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        color: 'var(--text-muted)',
      }}>
        <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 4px rgba(16,185,129,0.5)',
          animation: 'pulse-status 2s ease-in-out infinite',
        }} />
        Real Data Pipeline • PCA + Isolation Forest
      </div>
    </div>
  )
}

function getArchetypeColor(name) {
  const colors = {
    'Shadow Economy Zone': '#ff4444',
    'Formal Urban Hub': '#4488ff',
    'Residential Dense': '#44bb88',
    'Transit Corridor': '#ffaa33',
    'Normal': '#666666',
  }
  return colors[name] || '#666'
}
