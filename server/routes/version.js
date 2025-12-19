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
 * Trigger the update process - auto-detects Docker vs native
 */
router.post('/update', async (req, res) => {
  console.log('🔄 Update requested via API');

  const inDocker = versionService.isDocker();

  if (inDocker) {
    // Docker mode - try Watchtower
    console.log('🐳 Docker detected, trying Watchtower...');
    const result = await versionService.triggerWatchtowerUpdate().catch(err => ({
      success: false,
      error: err.message
    }));
    return res.json(result);
  }

  // Native mode - run update script
  console.log('📦 Native mode, running update script...');
  const result = await versionService.runUpdate().catch(err => ({
    success: false,
    error: err.message
  }));

  res.json({
    ...result,
    note: 'Poll /api/health to detect when server is back online'
  });
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

/**
 * POST /api/version/client/rebuild
 * Rebuild the client bundle (for Docker plugin installations)
 */
router.post('/client/rebuild', async (req, res) => {
  console.log('🔨 Client rebuild requested via API');

  const result = await versionService.rebuildClient();
  res.json(result);
});

module.exports = router;
