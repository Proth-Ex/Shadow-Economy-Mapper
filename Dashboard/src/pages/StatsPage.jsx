import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { fetchStats } from '../services/api'

// ── Helpers ───────────────────────────────────────────────────
const fmt = n => n >= 1e7
  ? `₹${(n / 1e7).toFixed(1)}Cr`
  : `₹${(n / 1e5).toFixed(1)}L`

const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
const CAT_COLORS  = ['#00d4ff', '#3b82f6', '#8b5cf6', '#f59e0b']

// ── Custom tooltip ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-primary)' }}>
          {p.name}: {typeof p.value === 'number' && p.name.includes('Turnover')
            ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────
function KPI({ icon, value, label, delta, deltaDir }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {delta && (
        <div className={`kpi-delta ${deltaDir}`}>{delta}</div>
      )}
    </div>
  )
}

// ── Stats Page ────────────────────────────────────────────────
export default function StatsPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner" />
          Loading statistics…
        </div>
      </div>
    )
  }

  const { overview, riskDistribution, categoryBreakdown, monthlyTrend, topZonesByRisk, alerts } = data

  return (
    <div className="page">

      {/* ── KPI Row ── */}
      <div className="kpi-grid">
        <KPI icon="🗺️" value={overview.totalZones}          label="Active Zones"         delta="Goa Region" deltaDir="" />
        <KPI icon="💰" value={fmt(overview.totalEstimatedTurnover)} label="Est. Shadow Turnover" delta="+8.4% MoM" deltaDir="up" />
        <KPI icon="👥" value={overview.totalActiveAgents.toLocaleString()} label="Active Agents"  delta="-3.1% MoM" deltaDir="down" />
        <KPI icon="📉" value={`${overview.gdpLeakagePercent}%`} label="GDP Leakage"       delta="Above threshold" deltaDir="up" />
        <KPI icon="🏛️" value={fmt(overview.taxRevenueGap)}   label="Tax Revenue Gap"     delta="Annual Est." deltaDir="" />
      </div>

      <div className="stats-grid">

        {/* ── Monthly Trend Chart ── */}
        <div className="card full-width">
          <div className="card-title">📈 Monthly Turnover Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2d44" strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: '#7c93b0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#7c93b0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="turnover" name="Turnover"
                stroke="#00d4ff" strokeWidth={2}
                fill="url(#gradCyan)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Category Breakdown ── */}
        <div className="card">
          <div className="card-title">📦 Category Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryBreakdown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e2d44" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="category"
                tickFormatter={v => v.replace(/_/g, ' ').slice(0, 10)}
                tick={{ fill: '#7c93b0', fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#7c93b0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="turnover" name="Turnover" radius={[4, 4, 0, 0]}>
                {categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Risk Distribution ── */}
        <div className="card">
          <div className="card-title">⚠️ Risk Distribution</div>
          <div className="risk-bar-wrap" style={{ marginTop: 16 }}>
            {Object.entries(riskDistribution).map(([level, count]) => {
              const total = Object.values(riskDistribution).reduce((a,b) => a+b, 0)
              const pct   = Math.round((count / total) * 100)
              return (
                <div className="risk-bar-row" key={level}>
                  <span className="risk-bar-label">
                    <span className={`badge ${level}`}>{level}</span>
                  </span>
                  <div className="risk-bar-bg">
                    <div
                      className="risk-bar-fill"
                      style={{ width: `${pct}%`, background: RISK_COLORS[level] }}
                    />
                  </div>
                  <span className="risk-bar-count">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Risk score table */}
          <div style={{ marginTop: 24 }}>
            <div className="card-title">🔢 Risk Scores by Zone</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {topZonesByRisk.map(z => {
                  const level = z.riskScore >= 80 ? 'high' : z.riskScore >= 50 ? 'medium' : 'low'
                  return (
                    <tr key={z.id}>
                      <td>{z.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: RISK_COLORS[level] }}>
                        {z.riskScore}
                      </td>
                      <td><span className={`badge ${level}`}>{level}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Alerts ── */}
        <div className="card full-width">
          <div className="card-title">🚨 Active Alerts</div>
          {alerts.map(alert => (
            <div className="alert-item" key={alert.id}>
              <div className={`alert-dot ${alert.severity}`} />
              <div>
                <div className="alert-msg">{alert.message}</div>
                <div className="alert-time">{alert.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
