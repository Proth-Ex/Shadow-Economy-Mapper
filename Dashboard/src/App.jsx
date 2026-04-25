import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar          from './components/Sidebar'
import Topbar           from './components/Topbar'
import MapPage          from './pages/MapPage'
import StatsPage        from './pages/StatsPage'
import IntelligencePage from './pages/IntelligencePage'
import ReportsPage      from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
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
