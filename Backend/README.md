# Shadow Economy Mapper — Backend API

Node.js + Express REST API powering the Shadow Economy Mapper dashboard.

**Base URL (dev):** `http://localhost:5000`

---

## 🚀 Getting Started

```bash
cd Backend
npm install
npm run dev      # nodemon — hot reload
# or
npm start        # plain node
```

The server starts on **port 5000** (configurable via `.env`).

---

## 📡 API Endpoints

### Health

| Method | Endpoint       | Description               |
|--------|----------------|---------------------------|
| GET    | `/api/health`  | Server liveness check     |

**Response**
```json
{ "status": "ok", "timestamp": "2026-04-25T08:00:00.000Z" }
```

---

### 🗺️ Maps — `/api/maps`

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/maps/zones`     | List all shadow economy zones      |
| GET    | `/api/maps/zones/:id` | Get a single zone by ID            |

#### `GET /api/maps/zones`
Returns all zones with coordinates, risk level, and activity metadata.

```json
{
  "success": true,
  "count": 5,
  "region": "Goa, India",
  "data": [
    {
      "id": "zone-001",
      "name": "Mapusa Market Corridor",
      "riskLevel": "high",
      "category": "informal_trade",
      "estimatedTurnover": 4200000,
      "activeAgents": 312,
      "description": "...",
      "coordinates": [[lat, lng], ...]
    }
  ]
}
```

#### `GET /api/maps/zones/:id`
Returns a single zone. Returns `404` if not found.

```json
{ "success": true, "data": { ...zone } }
```

**Zone IDs:** `zone-001` → `zone-005`

**Risk Levels:** `high` | `medium` | `low`

**Categories:** `informal_trade` | `tourism_black_market` | `cash_economy` | `smuggling`

---

### 📊 Stats — `/api/stats`

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | `/api/stats`         | Full stats payload                 |
| GET    | `/api/stats/overview`| High-level KPI overview            |
| GET    | `/api/stats/trends`  | Monthly turnover trend data        |
| GET    | `/api/stats/alerts`  | Active system alerts               |

#### `GET /api/stats`
Returns the complete stats object (overview + risk distribution + category breakdown + monthly trend + zone risk scores + alerts).

#### `GET /api/stats/overview`
```json
{
  "success": true,
  "data": {
    "totalZones": 5,
    "totalEstimatedTurnover": 28600000,
    "totalActiveAgents": 1340,
    "gdpLeakagePercent": 18.4,
    "taxRevenueGap": 5200000,
    "lastUpdated": "2026-04-25T00:00:00Z"
  }
}
```

#### `GET /api/stats/trends`
```json
{
  "success": true,
  "data": [
    { "month": "Nov 2025", "turnover": 21000000, "newZones": 1 },
    ...
  ]
}
```

#### `GET /api/stats/alerts`
```json
{
  "success": true,
  "data": [
    { "id": "alert-001", "severity": "critical", "message": "...", "time": "2h ago" },
    ...
  ]
}
```

**Severity levels:** `critical` | `warning` | `info`

---

### 🧠 Intelligence — `/api/intelligence` *(Placeholder)*

| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | `/api/intelligence`        | Module overview + empty feed   |
| GET    | `/api/intelligence/feed`   | Live signal feed (stub)        |

> ⚠️ **Status:** Not yet implemented. Returns placeholder/empty responses. Full SIGINT/HUMINT/OSINT/FININT pipeline planned for **Phase 2**.

```json
{
  "success": true,
  "message": "Intelligence pipeline not yet active. Dummy data returned.",
  "data": { "activeSources": 0, "reportsIngested": 0, "flaggedSignals": 0, "verifiedTips": 0, "feed": [] }
}
```

---

### 📄 Reports — `/api/reports` *(Placeholder)*

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| GET    | `/api/reports`  | Report list + scheduled jobs   |

> ⚠️ **Status:** Not yet implemented. Returns placeholder response. Full report generation/export planned for **Phase 2**.

```json
{
  "success": true,
  "message": "Reports module is not yet implemented. Coming in Phase 2.",
  "data": { "reports": [], "scheduledJobs": 0, "lastExport": null }
}
```

---

## 🗂️ Project Structure

```
Backend/
├── .env                  # PORT, NODE_ENV
├── package.json
└── src/
    ├── index.js          # Express app entry point
    ├── data/
    │   ├── zones.js      # Dummy zone data (5 zones, Goa)
    │   └── stats.js      # Dummy stats, trends, alerts
    └── routes/
        ├── maps.js       # /api/maps/*
        ├── stats.js      # /api/stats/*
        ├── intelligence.js # /api/intelligence/* (stub)
        └── reports.js    # /api/reports (stub)
```

---

## 🔧 Environment Variables

| Variable    | Default       | Description        |
|-------------|---------------|--------------------|
| `PORT`      | `5000`        | Server listen port |
| `NODE_ENV`  | `development` | Runtime environment|