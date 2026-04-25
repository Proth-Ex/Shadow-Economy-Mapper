import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar          from './components/Sidebar'
import Topbar           from './components/Topbar'
import MapPage          from './pages/MapPage'
import StatsPage        from './pages/StatsPage'
import IntelligencePage from './pages/IntelligencePage'
import ReportsPage      from './pages/ReportsPage'
import GlobeIntro       from './components/GlobeIntro'

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)

  if (!introComplete) {
    return <GlobeIntro onComplete={() => setIntroComplete(true)} />
  }

  return (
    <BrowserRouter>
      <div className="app-shell" style={{ animation: 'fadeIn 0.8s ease-in' }}>
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/"             element={<MapPage />} />
            <Route path="/stats"        element={<StatsPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/reports"      element={<ReportsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}