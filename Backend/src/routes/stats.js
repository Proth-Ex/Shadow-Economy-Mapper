const express = require('express');
const router  = express.Router();
const stats   = require('../data/stats');

/**
 * GET /api/stats
 * Returns full stats payload.
 */
router.get('/', (_req, res) => {
  res.json({ success: true, data: stats });
});

/**
 * GET /api/stats/overview
 * Returns only the high-level overview metrics.
 */
router.get('/overview', (_req, res) => {
  res.json({ success: true, data: stats.overview });
});

/**
 * GET /api/stats/trends
 * Returns monthly trend data.
 */
router.get('/trends', (_req, res) => {
  res.json({ success: true, data: stats.monthlyTrend });
});

/**
 * GET /api/stats/alerts
 * Returns active system alerts.
 */
router.get('/alerts', (_req, res) => {
  res.json({ success: true, data: stats.alerts });
});

module.exports = router;
