const express = require('express');
const router  = express.Router();

/**
 * GET /api/intelligence
 * Placeholder — returns dummy signal feed.
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Intelligence pipeline not yet active. Dummy data returned.',
    data: {
      activeSources: 0,
      reportsIngested: 0,
      flaggedSignals: 0,
      verifiedTips: 0,
      feed: [],
    }
  });
});

/**
 * GET /api/intelligence/feed
 * Placeholder feed endpoint.
 */
router.get('/feed', (_req, res) => {
  res.json({
    success: true,
    data: [],
    note: 'Live feed will be connected in Phase 2.'
  });
});

module.exports = router;
