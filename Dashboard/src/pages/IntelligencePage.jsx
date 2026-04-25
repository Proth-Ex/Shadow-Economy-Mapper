import React from 'react'

// ── Mock agent feed ───────────────────────────────────────────
const MOCK_FEED = [
  { id: 'INT-001', type: 'SIGINT',  region: 'Vasco Docks',       status: 'unverified', time: '09:14 IST', summary: 'Unusual container movement pattern detected at Berth 7.' },
  { id: 'INT-002', type: 'HUMINT',  region: 'Mapusa Market',     status: 'verified',   time: '08:32 IST', summary: 'Source confirms new hawker syndicate operating under "Durga Traders" alias.' },
  { id: 'INT-003', type: 'OSINT',   region: 'Calangute',         status: 'unverified', time: '07:55 IST', summary: 'Social media chatter indicates bulk cash exchange planned for tonight.' },
  { id: 'INT-004', type: 'FININT',  region: 'Margao Bazaar',     status: 'flagged',    time: '06:10 IST', summary: 'Hawala transaction cluster — ₹18L equivalent moved across 12 accounts.' },
]

const TYPE_COLORS = {
  SIGINT:  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  HUMINT:  { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.3)' },
  OSINT:   { bg: 'rgba(0,212,255,0.10)',  color: '#00d4ff', border: 'rgba(0,212,255,0.25)' },
  FININT:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
}

const STATUS_COLORS = {
  verified:   { color: '#10b981', label: '✅ Verified'   },
  unverified: { color: '#7c93b0', label: '🔍 Unverified' },
  flagged:    { color: '#ef4444', label: '🚩 Flagged'    },
}

function PlannedBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      color: 'var(--text-muted)',
      background: 'var(--border)',
      borderRadius: 4, padding: '2px 8px',
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      Planned
    </span>
  )
}

export default function IntelligencePage() {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        ODC / Shadow Mapper / <span style={{ color: 'var(--accent-cyan)' }}>Intelligence</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            🧠 Field Intelligence Hub
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Aggregated SIGINT, HUMINT, OSINT &amp; FININT feeds — <em>placeholder data, full integration coming soon.</em>
          </p>
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-sm)', padding: '6px 14px',
          fontSize: 12, color: '#ef4444', fontWeight: 600,
        }}>
          🔴 LIVE FEED — MODULE PENDING
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: '📡', label: 'Active Sources',    value: '–'  },
          { icon: '🗂️', label: 'Reports Ingested',  value: '–'  },
          { icon: '🚩', label: 'Flagged Signals',   value: '–'  },
          { icon: '🤝', label: 'Verified Tips',     value: '–'  },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value" style={{ fontSize: 22, color: 'var(--text-muted)' }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* ── Mock Feed ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>📥 Intelligence Feed · Today (Dummy)</div>
            <span style={{
              fontSize: 11, color: 'var(--accent-cyan)',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 99, padding: '3px 10px',
            }}>
              {MOCK_FEED.length} signals
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_FEED.map(item => {
              const tc = TYPE_COLORS[item.type]
              const sc = STATUS_COLORS[item.status]
              return (
                <div key={item.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  transition: 'border-color 0.2s',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {/* Type badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
                      background: tc.bg, color: tc.color,
                      border: `1px solid ${tc.border}`,
                      borderRadius: 4, padding: '2px 8px',
                    }}>
                      {item.type}
                    </span>
                    {/* ID */}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.id}
                    </span>
                    {/* Status */}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: sc.color }}>{sc.label}</span>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>
                    {item.summary}
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>📍 {item.region}</span>
                    <span>🕐 {item.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Planned Features Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card">
            <div className="card-title">🔧 Planned Integrations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {[
                { icon: '🛰️', label: 'Satellite Pattern Analysis', desc: 'ML-based anomaly detection on satellite feeds' },
                { icon: '📞', label: 'SIGINT Aggregator',           desc: 'Intercepted communications correlation engine' },
                { icon: '💰', label: 'FININT Pipeline',             desc: 'Real-time hawala & crypto transaction flagging' },
                { icon: '🤖', label: 'AI Risk Scoring',             desc: 'GPT-powered signal triage and scoring system' },
                { icon: '🔗', label: 'Network Graph',               desc: 'Agent-entity relationship mapping visualizer' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <PlannedBadge />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}>
            <div className="card-title" style={{ color: 'var(--accent-cyan)' }}>📌 Module Status</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              This module is a <strong style={{ color: 'var(--text-primary)' }}>placeholder</strong>.
              Full intelligence pipeline will be activated in <strong style={{ color: 'var(--accent-cyan)' }}>Phase 2</strong>
              of the ODC Shadow Economy Mapper project.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
