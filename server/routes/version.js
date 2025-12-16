/**
 * Version API Routes
 * Check for updates and trigger update process
 */

const express = require('express');
const router = express.Router();
const versionService = require('../services/version-service');

/**
 * GET /api/version
 * Get current version info
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    version: versionService.getCurrentVersion()
  });
});

/**
 * GET /api/version/check
 * Check for updates against GitHub releases
 */
router.get('/check', async (req, res) => {
  const result = await versionService.checkForUpdate();
  res.json({
    success: true,
    ...result
  });
});

/**
 * POST /api/version/update
 * Trigger the update process
 */
router.post('/update', async (req, res) => {
  console.log('🔄 Update requested via API');

  // Send initial response
  res.json({
    success: true,
    message: 'Update started. Server will restart shortly.',
    note: 'Poll /api/health to detect when server is back online'
  });

  // Run update after response is sent
  setTimeout(async () => {
    await versionService.runUpdate().catch(err => {
      console.error('❌ Update failed:', err.message);
    });
  }, 100);
});

module.exports = router;
