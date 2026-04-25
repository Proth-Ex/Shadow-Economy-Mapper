import React from 'react'

// ── Reusable Placeholder Shell ────────────────────────────────
function ComingSoonCard({ icon, title, subtitle, features }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '40px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      maxWidth: 560,
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 72, height: 72,
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(59,130,246,0.15))',
        border: '1px solid rgba(0,212,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 24,
        boxShadow: '0 0 30px rgba(0,212,255,0.1)',
      }}>
        {icon}
      </div>

      {/* Pill */}
      <div style={{
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 99, padding: '4px 14px',
        fontSize: 11, fontWeight: 700,
        color: 'var(--accent-cyan)',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        Coming Soon
      </div>

      <h1 style={{
        fontSize: 28, fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 12, lineHeight: 1.2,
      }}>
        {title}
      </h1>

      <p style={{
        fontSize: 14, color: 'var(--text-secondary)',
        lineHeight: 1.7, marginBottom: 32,
      }}>
        {subtitle}
      </p>

      {/* Feature list */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'left',
          }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
            </div>
            <div style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--border)',
              borderRadius: 4, padding: '2px 8px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Planned
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Reports Page ──────────────────────────────────────────────
export default function ReportsPage() {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        ODC / Shadow Mapper / <span style={{ color: 'var(--accent-cyan)' }}>Reports</span>
      </div>

      <ComingSoonCard
        icon="📄"
        title="Reports & Exports"
        subtitle="Generate, schedule, and export shadow economy analysis reports in PDF, CSV, and JSON formats. This module will integrate with the core analytics engine."
        features={[
          { icon: '📊', label: 'Zone Summary Reports',      desc: 'Detailed per-zone economic activity breakdowns' },
          { icon: '📅', label: 'Scheduled Report Delivery', desc: 'Auto-generate and email weekly/monthly digests' },
          { icon: '📤', label: 'Multi-format Export',       desc: 'Export data as PDF, Excel, CSV, or GeoJSON' },
          { icon: '🔍', label: 'Audit Trail Logs',          desc: 'Immutable logs of all data access and edits' },
          { icon: '📌', label: 'Custom Report Builder',     desc: 'Drag-and-drop report composition tool' },
        ]}
      />

      {/* Dummy stats bar at the bottom */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        maxWidth: 560, margin: '0 auto', width: '100%',
      }}>
        {[
          { label: 'Reports Generated', value: '–',   unit: 'this month' },
          { label: 'Last Export',       value: '–',   unit: 'no data yet' },
          { label: 'Scheduled Jobs',    value: '0',   unit: 'active' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-muted)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: 'var(--border-bright)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{s.unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
