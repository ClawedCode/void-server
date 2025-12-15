const express = require('express');
const browserService = require('../services/browser-service');

const router = express.Router();

/**
 * Browser Management API
 *
 * Manages persistent browser profiles for plugins that need
 * authenticated browser sessions.
 */

// List all browser profiles
router.get('/', async (req, res) => {
  console.log('🌐 GET /api/browsers');
  const browsers = await browserService.listBrowsers();
  console.log(`✅ Listed ${browsers.length} browser profiles`);
  res.json({ success: true, browsers });
});

// Get single browser profile
router.get('/:id', async (req, res) => {
  console.log(`🌐 GET /api/browsers/${req.params.id}`);
  const browser = await browserService.getBrowser(req.params.id);

  if (!browser) {
    return res.status(404).json({ success: false, error: 'Browser profile not found' });
  }

  res.json({ success: true, browser });
});

// Get browser status
router.get('/:id/status', async (req, res) => {
  console.log(`🌐 GET /api/browsers/${req.params.id}/status`);
  const result = await browserService.getBrowserStatus(req.params.id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// Create new browser profile
router.post('/', async (req, res) => {
  const { id, name, description } = req.body;
  console.log(`🌐 POST /api/browsers id=${id} name="${name}"`);

  if (!id) {
    return res.status(400).json({ success: false, error: 'Browser ID is required' });
  }

  const result = await browserService.createBrowser(id, { name, description });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Launch browser for authentication
router.post('/:id/launch', async (req, res) => {
  const { url } = req.body;
  console.log(`🌐 POST /api/browsers/${req.params.id}/launch url=${url || 'about:blank'}`);

  const result = await browserService.launchBrowser(req.params.id, { url });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Close running browser
router.post('/:id/close', async (req, res) => {
  console.log(`🌐 POST /api/browsers/${req.params.id}/close`);

  const result = await browserService.closeBrowser(req.params.id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Delete browser profile
router.delete('/:id', async (req, res) => {
  console.log(`🌐 DELETE /api/browsers/${req.params.id}`);

  const result = await browserService.deleteBrowser(req.params.id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

module.exports = router;
