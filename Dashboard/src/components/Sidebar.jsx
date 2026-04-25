import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/',             icon: '🗺️',  label: 'Map View'      },
  { to: '/stats',        icon: '📊',  label: 'Statistics'    },
  { to: '/intelligence', icon: '🧠',  label: 'Intelligence'  },
  { to: '/reports',      icon: '📄',  label: 'Reports'       },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🕵️</div>
          <div className="logo-text">
            <span>Shadow Mapper</span>
            <span>ODC / GOA</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-pill">
          <div className="status-dot" />
          <span>API Connected</span>
        </div>
      </div>
    </aside>
  )
}
