const ARCHETYPE_LEGEND = [
  { name: 'Shadow Economy', color: '#ff4444' },
  { name: 'Formal Urban', color: '#4488ff' },
  { name: 'Residential', color: '#44bb88' },
  { name: 'Transit', color: '#ffaa33' },
]

export default function Legend({ colorMode }) {
  return (
    <div className="legend-panel glass-panel">
      <div className="legend-title">
        {colorMode === 'score' ? 'Shadow Score' : 'Archetypes'}
      </div>

      {colorMode === 'score' ? (
        <>
          <div className="legend-gradient">
            <div className="legend-gradient-bar" />
          </div>
          <div className="legend-gradient-labels">
            <span>0 Low</span>
            <span>50</span>
            <span>100 High</span>
          </div>
        </>
      ) : (
        <div className="legend-items">
          {ARCHETYPE_LEGEND.map(item => (
            <div key={item.name} className="legend-item">
              <span className="legend-dot" style={{ background: item.color }} />
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
