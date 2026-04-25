export default function DataSourceBadge({ gridSize, cellCount }) {
  const dataSources = [
    { name: 'VIIRS Night Lights', icon: '🌙' },
    { name: 'OSM Road Network', icon: '🛣️' },
    { name: 'OSM Business POIs', icon: '🏪' },
    { name: 'Population Census', icon: '👥' },
  ]

  return (
    <div className="data-source-badge glass-panel">
      <div className="data-source-header">
        <span className="data-source-icon">📡</span>
        <span className="data-source-title">LIVE DATA SOURCES</span>
      </div>

      <div className="data-source-grid-info">
        <span className="data-source-grid-label">Grid Resolution</span>
        <span className="data-source-grid-value">{gridSize}</span>
      </div>

      <div className="data-source-grid-info">
        <span className="data-source-grid-label">Total Cells</span>
        <span className="data-source-grid-value">{cellCount}</span>
      </div>

      <div className="data-source-list">
        {dataSources.map(src => (
          <div key={src.name} className="data-source-item">
            <span className="data-source-item-icon">{src.icon}</span>
            <span className="data-source-item-name">{src.name}</span>
            <span className="data-source-status-dot" />
          </div>
        ))}
      </div>
    </div>
  )
}
