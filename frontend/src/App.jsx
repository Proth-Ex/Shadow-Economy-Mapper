import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import GlobeIntro from './components/GlobeIntro'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import StatsPanel from './components/StatsPanel'
import FilterPanel from './components/FilterPanel'
import Legend from './components/Legend'
import DataSourceBadge from './components/DataSourceBadge'
import StatsPage from './components/StatsPage'


const API_BASE = import.meta.env.VITE_API_URL ;
console.log(API_BASE);


/* ── Navigation Bar ── */
function NavBar() {
  return (
    <nav className="app-nav">
      <NavLink to="/" className="app-nav-brand">
        <span className="nav-icon">🗺️</span>
        <span className="nav-title">SHADOW ECONOMY MAPPER</span>
      </NavLink>
      <div className="app-nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">🌍</span>
          Map
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">📊</span>
          Analytics
        </NavLink>
      </div>
    </nav>
  )
}

/* ── Map Page (existing content) ── */
function MapPage() {
  const [cells, setCells] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [activeArchetypes, setActiveArchetypes] = useState(new Set([
    'Shadow Economy Zone', 'Formal Urban Hub', 'Residential Dense', 'Transit Corridor', 'Normal'
  ]))
  const [activeConfidence, setActiveConfidence] = useState(new Set(['high', 'medium', 'low']))
  const [colorMode, setColorMode] = useState('score')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [cellsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/cells`),
          fetch(`${API_BASE}/api/stats`),
        ])
        if (!cellsRes.ok || !statsRes.ok) throw new Error('API request failed')
        const cellsData = await cellsRes.json()
        const statsData = await statsRes.json()
        setCells(cellsData.cells || [])
        setStats(statsData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to connect to backend. Make sure the FastAPI server is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredCells = cells.filter(cell => {
    if (!activeArchetypes.has(cell.archetype)) return false
    if (!activeConfidence.has(cell.confidence)) return false
    return true
  })

  const toggleArchetype = useCallback((archetype) => {
    setActiveArchetypes(prev => {
      const next = new Set(prev)
      if (next.has(archetype)) next.delete(archetype)
      else next.add(archetype)
      return next
    })
  }, [])

  const toggleConfidence = useCallback((level) => {
    setActiveConfidence(prev => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }, [])

  const handleCellClick = useCallback((cell) => setSelectedCell(cell), [])
  const handleClosePanel = useCallback(() => setSelectedCell(null), [])

  if (loading) {
    return (
      <div className="loading-overlay" style={{ top: 56 }}>
        <div className="loading-spinner" />
        <div className="loading-text">Analyzing shadow economy signals...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-overlay" style={{ top: 56 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
        <div className="loading-text">{error}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Run: <code style={{ color: 'var(--accent-cyan)' }}>python main.py</code> in the backend directory
        </div>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ paddingTop: 56 }}>
      {/* Map */}
      <div className="map-wrapper" style={{ top: 56 }}>
        <MapView
          cells={filteredCells}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          colorMode={colorMode}
        />
      </div>

      {/* Stats Panel - top left */}
      {stats && <StatsPanel stats={stats} />}

      {/* Filter Panel */}
      {!selectedCell && (
        <FilterPanel
          activeArchetypes={activeArchetypes}
          activeConfidence={activeConfidence}
          onToggleArchetype={toggleArchetype}
          onToggleConfidence={toggleConfidence}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />
      )}

      {/* Sidebar */}
      {selectedCell && (
        <Sidebar cell={selectedCell} onClose={handleClosePanel} />
      )}

      {/* Legend */}
      <Legend colorMode={colorMode} />

      {/* Data Source Badge */}
      {!selectedCell && <DataSourceBadge gridSize="5km × 5km" cellCount={cells.length} />}

      {/* Prompt */}
      {!selectedCell && (
        <div className="no-selection glass-panel">
          Click a grid cell to inspect real geospatial signals
        </div>
      )}
    </div>
  )
}

/* ── App Root ── */
function App() {
  const [introComplete, setIntroComplete] = useState(false)

  if (!introComplete) {
    return <GlobeIntro onComplete={() => setIntroComplete(true)} />
  }

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </>
  )
}

export default App
