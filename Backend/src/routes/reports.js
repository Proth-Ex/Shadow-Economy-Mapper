const express = require('express');
const router  = express.Router();

/**
 * GET /api/reports
 * Placeholder — returns empty report list.
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Reports module is not yet implemented. Coming in Phase 2.',
    data: {
      reports: [],
      scheduledJobs: 0,
      lastExport: null,
    }
  });
});

module.exports = router;
