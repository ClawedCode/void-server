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
 * GET /api/version/environment
 * Get environment info (Docker vs native)
 */
router.get('/environment', (req, res) => {
  res.json({
    success: true,
    isDocker: versionService.isDocker(),
    updateMethod: versionService.isDocker() ? 'watchtower' : 'script'
  });
});

/**
 * POST /api/version/update
 * Trigger the update process (native installations)
 */
router.post('/update', async (req, res) => {
  console.log('🔄 Update requested via API');

  // For Docker, redirect to watchtower endpoint
  if (versionService.isDocker()) {
    return res.status(400).json({
      success: false,
      error: 'Docker installation detected. Use /api/version/update/docker endpoint instead.'
    });
  }

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

/**
 * POST /api/version/update/docker
 * Trigger Watchtower to update Docker container
 */
router.post('/update/docker', async (req, res) => {
  console.log('🐳 Docker update requested via API');

  if (!versionService.isDocker()) {
    return res.status(400).json({
      success: false,
      error: 'Not running in Docker. Use /api/version/update endpoint instead.'
    });
  }

  const result = await versionService.triggerWatchtowerUpdate();
  res.json(result);
});

module.exports = router;
