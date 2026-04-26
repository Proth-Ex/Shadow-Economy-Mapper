# 🗺️ Shadow Economy Mapper

**Geospatial intelligence platform for estimating informal economic activity using real-world satellite, census, and OpenStreetMap data.**

Built for Goa, India — analyzing a 21×15 grid (315 cells, each ~5km×5km) to identify areas where informal economies may be operating, using multi-source proxy signals and unsupervised ML.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikitlearn)

---

## 🎯 Problem Statement

Shadow economies — informal, unregistered economic activities — are notoriously difficult to measure. Traditional methods rely on surveys and tax data, which miss the very activity they're trying to capture. 

**Shadow Economy Mapper** takes a different approach: using publicly available geospatial data as proxy signals to estimate where informal economic activity is likely occurring, without relying on self-reported data.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA COLLECTION                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Google Earth  │  │  OSM Overpass │  │  Census / Pop.   │  │
│  │ Engine (VIIRS)│  │  API          │  │  Data            │  │
│  │              │  │              │  │                  │  │
│  │ Nighttime    │  │ • Roads      │  │ Population       │  │
│  │ Light        │  │ • Businesses │  │ Density          │  │
│  │ Intensity    │  │ • Amenities  │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  light_intensity   mobility.py          population.json    │
│  _zones.json       registered_          (pre-computed)     │
│                    density.py                              │
└─────────────────────┬───────────────────────┬──────────────┘
                      │                       │
                      ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ML PIPELINE (ml_pipeline.py)              │
│                                                             │
│  Stage 1: Min-Max Feature Normalization                     │
│  Stage 2: PCA-Derived Weights → Shadow Economy Index Score  │
│  Stage 3: Isolation Forest Anomaly Detection                │
│  Stage 4: K-Means Archetype Clustering                      │
│  Stage 5: Confidence Scoring + Informal Probability         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI REST API (main.py)                  │
│                                                             │
│  GET /api/cells          → All grid cells (filterable)      │
│  GET /api/cells/{id}     → Single cell details              │
│  GET /api/stats          → Aggregate statistics             │
│  GET /api/stats/signals  → Signal analysis                  │
│  GET /api/stats/distribution → Score distribution           │
│  GET /api/archetypes     → Archetype breakdown              │
│  GET /api/health         → Health check                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                       │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 3D Globe    │  │ Interactive  │  │ Analytics        │   │
│  │ Intro       │  │ Map (Leaflet)│  │ Dashboard        │   │
│  │ (Three.js)  │  │              │  │                  │   │
│  │             │  │ • Grid cells │  │ • Score hist.    │   │
│  │ Animated    │  │ • Color modes│  │ • Archetype dist │   │
│  │ zoom to Goa │  │ • Filters    │  │ • Signal stats   │   │
│  │             │  │ • Sidebar    │  │ • Top hotspots   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Data Sources

| Signal | Source | What It Measures | Proxy For |
|--------|--------|-----------------|-----------|
| **Nighttime Light Intensity** | NOAA VIIRS via Google Earth Engine | Radiance from satellite imagery (2023 monthly avg) | Economic activity level — high light in areas without formal businesses suggests informal markets |
| **Road Network Density** | OpenStreetMap Overpass API | Count of primary/secondary/tertiary/residential roads per cell | Mobility & accessibility — informal economies cluster near accessible areas |
| **Registered Business Density** | OpenStreetMap Overpass API | Count of shops, offices, restaurants per cell | Formal economy presence — low formal + high activity = potential informal |
| **Population Density** | Census data | Population per grid cell | Demand driver — more people = more economic activity (formal or informal) |

### Key Insight
The shadow economy score is highest where there's a **mismatch**: high nighttime light (activity), high population, good road access, but **low registered business density**. This gap between observable economic activity and formal registrations is the signal.

---

## 🤖 ML Pipeline

The pipeline runs 5 stages on the 315-cell grid:

### Stage 1 — Feature Normalization
Min-Max scales all four proxy signals to `[0, 1]`.

### Stage 2 — Shadow Economy Index (PCA Weights)
PCA extracts the principal component from the feature matrix. The absolute loadings of PC1 become the weights for computing a composite **Shadow Economy Score**. Registered business density gets a **negative weight** (higher formal presence suppresses the score). Falls back to hand-tuned PRD weights if PCA gives degenerate results.

### Stage 3 — Isolation Forest
Anomaly detection with 15% contamination rate. Cells flagged as anomalous (outlier behavior across the 4 signals) are candidates for deeper analysis.

### Stage 4 — K-Means Clustering
Anomalous cells are clustered into 4 groups. Each cluster is post-hoc labeled based on its centroid's feature profile:

| Archetype | Characteristics |
|-----------|----------------|
| 🔴 **Shadow Economy Zone** | High light + high population + low formal business |
| 🔵 **Formal Urban Hub** | High formal business + high light |
| 🟢 **Residential Dense** | High population + low formal + low mobility |
| 🟠 **Transit Corridor** | Everything else (typically high mobility) |

### Stage 5 — Confidence & Informal Probability
- **Confidence** (high/medium/low): How many of the 4 signals agree with the informal economy pattern
- **Informal Probability**: Composite score combining anomaly score, archetype boost, and formal business penalty

---

## 🖥️ Frontend Features

### 🌍 3D Globe Intro
Cinematic Three.js globe animation that spins, aligns to Goa, and zooms in — transitioning into the map view.

### 🗺️ Interactive Map
- **Leaflet-based** dark-themed map with CARTO tiles
- **315 grid cells** rendered as colored rectangles
- **Two color modes**: Score gradient (green→red) or Archetype colors
- **Click any cell** to inspect its signals in a detail sidebar
- **Filter by** archetype type and confidence level
- **Stats panel** showing aggregate metrics at a glance

### 📊 Analytics Dashboard
- Hero metrics (total cells, anomalous count, detection rate, avg score)
- Archetype distribution bar chart
- Shadow score histogram
- Per-signal statistical breakdown (mean, median, max, non-zero count)
- Confidence distribution
- **Top 10 hotspots table** with direct Google Maps links

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the API server
python main.py
```

The server starts on `http://localhost:8000`. On first run, it loads the pre-processed data from `data/processed_cells.json`. If that file doesn't exist, it runs the full data loading + ML pipeline.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file for API URL
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

The frontend starts on `http://localhost:5173`.

### Re-running Data Collection (Optional)

If you need to refresh the underlying data from live APIs:

```bash
cd backend

# Nighttime light intensity (requires Google Earth Engine auth)
python light_intensity.py

# Road network from OSM
python mobility_calculation.py

# Business density from OSM
python registered_density.py

# Re-run ML pipeline on fresh data
python ml_pipeline.py
```

> **Note**: `light_intensity.py` requires Google Earth Engine authentication. The other scripts use the public OSM Overpass API.

---

## 📁 Project Structure

```
Shadow-Economy-Mapper/
├── backend/
│   ├── main.py                    # FastAPI app + lifespan
│   ├── ml_pipeline.py             # 5-stage ML pipeline
│   ├── data_loader.py             # Merges 4 data sources
│   ├── state.py                   # Shared app state
│   ├── light_intensity.py         # GEE VIIRS data collector
│   ├── mobility_calculation.py    # OSM road density collector
│   ├── registered_density.py      # OSM business density collector
│   ├── requirements.txt
│   ├── render.yaml                # Render deployment config
│   ├── routes/
│   │   ├── cells.py               # /api/cells endpoints
│   │   ├── stats.py               # /api/stats endpoints
│   │   ├── archetypes.py          # /api/archetypes endpoint
│   │   ├── pipeline.py            # /api/pipeline endpoint
│   │   └── health.py              # /api/health endpoint
│   └── data/
│       ├── light_intensity_zones.json
│       ├── mobility.json
│       ├── population.json
│       ├── zones_with_density.json
│       ├── raw_cells.json
│       └── processed_cells.json   # ML pipeline output
│
└── frontend/
    └── src/
        ├── App.jsx                # Main app + routing
        ├── App.css                # Global styles
        ├── index.css              # Design tokens
        ├── main.jsx               # Entry point
        └── components/
            ├── GlobeIntro.jsx     # Three.js globe animation
            ├── MapView.jsx        # Leaflet map + grid cells
            ├── Sidebar.jsx        # Cell detail panel
            ├── StatsPanel.jsx     # Map overlay stats
            ├── FilterPanel.jsx    # Archetype/confidence filters
            ├── Legend.jsx         # Color legend
            ├── DataSourceBadge.jsx# Grid info badge
            ├── StatsPage.jsx      # Analytics dashboard
            └── StatsPage.css      # Analytics styles
```

---

## 🌐 Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Backend API | Render | Configured via `render.yaml` |
| Frontend | Vercel | Auto-deploys from Git |

The frontend reads `VITE_API_URL` from environment variables to connect to the backend.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — REST API framework
- **scikit-learn** — Isolation Forest, K-Means, PCA, MinMaxScaler
- **pandas / numpy** — Data processing
- **Google Earth Engine API** — VIIRS satellite data
- **OSM Overpass API** — Road and business POI data

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool
- **Leaflet / react-leaflet** — Interactive mapping
- **Three.js** — 3D globe intro animation
- **Vanilla CSS** — Custom design system with glassmorphism

---
