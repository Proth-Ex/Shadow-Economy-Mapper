const ARCHETYPES = [
  { name: 'Shadow Economy Zone', color: '#ff4444' },
  { name: 'Formal Urban Hub', color: '#4488ff' },
  { name: 'Residential Dense', color: '#44bb88' },
  { name: 'Transit Corridor', color: '#ffaa33' },
  { name: 'Normal', color: '#666666' },
]

const CONFIDENCE_LEVELS = [
  { name: 'high', label: 'High' },
  { name: 'medium', label: 'Medium' },
  { name: 'low', label: 'Low' },
]

export default function FilterPanel({
  activeArchetypes,
  activeConfidence,
  onToggleArchetype,
  onToggleConfidence,
  colorMode,
  onColorModeChange,
}) {
  return (
    <div className="filter-panel glass-panel">
      <div className="filter-title">Filters</div>

      {/* Color Mode Toggle */}
      <div className="filter-group">
        <div className="filter-group-label">Color By</div>
        <div className="filter-chips">
          <button
            className={`filter-chip ${colorMode === 'score' ? 'active' : ''}`}
            onClick={() => onColorModeChange('score')}
          >
            Score
          </button>
          <button
            className={`filter-chip ${colorMode === 'archetype' ? 'active' : ''}`}
            onClick={() => onColorModeChange('archetype')}
          >
            Archetype
          </button>
        </div>
      </div>

      {/* Archetype Filters */}
      <div className="filter-group">
        <div className="filter-group-label">Archetypes</div>
        <div className="filter-chips">
          {ARCHETYPES.map(arch => (
            <button
              key={arch.name}
              className={`filter-chip ${activeArchetypes.has(arch.name) ? 'active' : ''}`}
              onClick={() => onToggleArchetype(arch.name)}
            >
              <span className="chip-dot" style={{ background: arch.color }} />
              {arch.name.replace('Shadow Economy Zone', 'Shadow').replace('Formal Urban Hub', 'Formal')}
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Filters */}
      <div className="filter-group">
        <div className="filter-group-label">Confidence</div>
        <div className="filter-chips">
          {CONFIDENCE_LEVELS.map(level => (
            <button
              key={level.name}
              className={`filter-chip ${activeConfidence.has(level.name) ? 'active' : ''}`}
              onClick={() => onToggleConfidence(level.name)}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
