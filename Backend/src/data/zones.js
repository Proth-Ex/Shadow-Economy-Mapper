/**
 * Dummy shadow economy zones for Goa.
 * Each zone has a GeoJSON polygon, a risk level, and activity metadata.
 */
const zones = [
  {
    id: "zone-001",
    name: "Mapusa Market Corridor",
    riskLevel: "high",
    category: "informal_trade",
    estimatedTurnover: 4200000,
    activeAgents: 312,
    description: "Dense cluster of unregistered street vendors and hawkers operating outside tax jurisdiction.",
    coordinates: [
      [15.5957, 73.8091],
      [15.6010, 73.8150],
      [15.5980, 73.8200],
      [15.5930, 73.8140],
      [15.5957, 73.8091]
    ]
  },
  {
    id: "zone-002",
    name: "Calangute Beach Strip",
    riskLevel: "medium",
    category: "tourism_black_market",
    estimatedTurnover: 7800000,
    activeAgents: 520,
    description: "Unlicensed tourism operators, drug trade, and cash-only hospitality services.",
    coordinates: [
      [15.5449, 73.7516],
      [15.5510, 73.7570],
      [15.5470, 73.7630],
      [15.5400, 73.7580],
      [15.5449, 73.7516]
    ]
  },
  {
    id: "zone-003",
    name: "Panjim Old Quarter",
    riskLevel: "low",
    category: "cash_economy",
    estimatedTurnover: 1500000,
    activeAgents: 145,
    description: "Old-city businesses operating on unrecorded cash transactions below GST threshold.",
    coordinates: [
      [15.4989, 73.8278],
      [15.5030, 73.8320],
      [15.5000, 73.8360],
      [15.4960, 73.8310],
      [15.4989, 73.8278]
    ]
  },
  {
    id: "zone-004",
    name: "Vasco Industrial Docks",
    riskLevel: "high",
    category: "smuggling",
    estimatedTurnover: 12000000,
    activeAgents: 88,
    description: "Port-adjacent smuggling routes for electronics, fuel, and luxury goods.",
    coordinates: [
      [15.3982, 73.8113],
      [15.4030, 73.8180],
      [15.3990, 73.8230],
      [15.3940, 73.8160],
      [15.3982, 73.8113]
    ]
  },
  {
    id: "zone-005",
    name: "Margao South Bazaar",
    riskLevel: "medium",
    category: "informal_trade",
    estimatedTurnover: 3100000,
    activeAgents: 275,
    description: "Wholesale informal market with unregistered goods and counterfeit products.",
    coordinates: [
      [15.2735, 73.9582],
      [15.2790, 73.9640],
      [15.2750, 73.9690],
      [15.2700, 73.9630],
      [15.2735, 73.9582]
    ]
  }
];

module.exports = zones;
