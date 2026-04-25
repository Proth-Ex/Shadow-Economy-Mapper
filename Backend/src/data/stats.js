/**
 * Dummy statistics for shadow economy analytics dashboard.
 */
const stats = {
  overview: {
    totalZones: 5,
    totalEstimatedTurnover: 28600000,
    totalActiveAgents: 1340,
    gdpLeakagePercent: 18.4,
    taxRevenueGap: 5200000,
    lastUpdated: "2026-04-25T00:00:00Z"
  },
  riskDistribution: {
    high: 2,
    medium: 2,
    low: 1
  },
  categoryBreakdown: [
    { category: "informal_trade",      zoneCount: 2, turnover: 7300000,  agents: 587 },
    { category: "tourism_black_market",zoneCount: 1, turnover: 7800000,  agents: 520 },
    { category: "smuggling",           zoneCount: 1, turnover: 12000000, agents: 88  },
    { category: "cash_economy",        zoneCount: 1, turnover: 1500000,  agents: 145 }
  ],
  monthlyTrend: [
    { month: "Nov 2025", turnover: 21000000, newZones: 1 },
    { month: "Dec 2025", turnover: 23500000, newZones: 0 },
    { month: "Jan 2026", turnover: 24800000, newZones: 1 },
    { month: "Feb 2026", turnover: 25900000, newZones: 0 },
    { month: "Mar 2026", turnover: 27100000, newZones: 1 },
    { month: "Apr 2026", turnover: 28600000, newZones: 0 }
  ],
  topZonesByRisk: [
    { id: "zone-004", name: "Vasco Industrial Docks",   riskScore: 94 },
    { id: "zone-001", name: "Mapusa Market Corridor",   riskScore: 81 },
    { id: "zone-002", name: "Calangute Beach Strip",    riskScore: 67 },
    { id: "zone-005", name: "Margao South Bazaar",      riskScore: 58 },
    { id: "zone-003", name: "Panjim Old Quarter",       riskScore: 32 }
  ],
  alerts: [
    { id: "alert-001", severity: "critical", message: "Spike in smuggling activity at Vasco Docks — +34% vs last month", time: "2h ago" },
    { id: "alert-002", severity: "warning",  message: "New cash-only cluster detected near Mapusa North", time: "6h ago" },
    { id: "alert-003", severity: "info",     message: "Calangute zone agents decreased by 12% post tourist season", time: "1d ago" }
  ]
};

module.exports = stats;
