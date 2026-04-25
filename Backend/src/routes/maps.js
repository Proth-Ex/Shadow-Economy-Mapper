const express = require('express');
const router  = express.Router();
const zones   = require('../data/zones');

/**
 * GET /api/maps/zones
 * Returns all shadow economy zones with polygon coordinates.
 */
router.get('/zones', (_req, res) => {
  res.json({
    success: true,
    count: zones.length,
    region: 'Goa, India',
    data: zones
  });
});

/**
 * GET /api/maps/zones/:id
 * Returns a single zone by its ID.
 */
router.get('/zones/:id', (req, res) => {
  const zone = zones.find(z => z.id === req.params.id);
  if (!zone) {
    return res.status(404).json({ success: false, error: 'Zone not found' });
  }
  res.json({ success: true, data: zone });
});

module.exports = router;
