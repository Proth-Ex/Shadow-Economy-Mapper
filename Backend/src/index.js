require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const mapsRouter         = require('./routes/maps');
const statsRouter        = require('./routes/stats');
const reportsRouter      = require('./routes/reports');
const intelligenceRouter = require('./routes/intelligence');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/maps',          mapsRouter);
app.use('/api/stats',         statsRouter);
app.use('/api/reports',       reportsRouter);
app.use('/api/intelligence',  intelligenceRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ error: 'Route not found' })
);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀  Shadow Economy API running on http://localhost:${PORT}`)
);
