import React from 'react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/':             'Map View – Shadow Economy Zones',
  '/stats':        'Statistics & Analytics',
  '/intelligence': 'Intelligence Hub',
  '/reports':      'Reports & Exports',
}

export default function Topbar() {
  const location  = useLocation()
  const title     = titles[location.pathname] ?? 'Shadow Economy Mapper'
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <span className="topbar-meta">🕐 {timestamp} IST</span>
    </div>
  )
}
