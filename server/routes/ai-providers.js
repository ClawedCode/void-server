/**
 * AI Providers REST API Routes
 */

const express = require('express');
const router = express.Router();
const aiProvider = require('../services/ai-provider');

/**
 * GET /api/ai-providers
 * Get all providers configuration
 */
router.get('/', (req, res) => {
  const providers = aiProvider.getProviders();
  res.json(providers);
});

/**
 * GET /api/ai-providers/active
 * Get active provider configuration
 */
router.get('/active', (req, res) => {
  const active = aiProvider.getActiveProvider();
  res.json({
    success: true,
    provider: active
  });
});

/**
 * POST /api/ai-providers/switch
 * Switch the active provider
 */
router.post('/switch', (req, res) => {
  const { provider } = req.body;

  if (!provider) {
    return res.status(400).json({ success: false, error: 'Provider key required' });
  }

  const result = aiProvider.switchProvider(provider);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * PUT /api/ai-providers/:provider
 * Update provider configuration
 */
router.put('/:provider', (req, res) => {
  const { provider } = req.params;
  const updates = req.body;

  const result = aiProvider.updateProviderConfig(provider, updates);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * POST /api/ai-providers/:provider/test
 * Test provider connection
 */
router.post('/:provider/test', async (req, res) => {
  const { provider } = req.params;

  const result = await aiProvider.testProvider(provider);
  res.json(result);
});

/**
 * GET /api/ai-providers/:provider/models
 * Get available models for a provider
 */
router.get('/:provider/models', async (req, res) => {
  const { provider } = req.params;

  const providerInstance = aiProvider.getProvider(provider);

  if (!providerInstance) {
    return res.status(404).json({
      success: false,
      error: `Provider "${provider}" not found or disabled`
    });
  }

  const result = await providerInstance.getModels();
  res.json(result);
});

/**
 * POST /api/ai-providers/:provider/validate
 * Validate provider configuration
 */
router.post('/:provider/validate', (req, res) => {
  const { provider } = req.params;

  const providerInstance = aiProvider.getProvider(provider);

  if (!providerInstance) {
    return res.status(404).json({
      success: false,
      error: `Provider "${provider}" not found or disabled`
    });
  }

  const result = providerInstance.validateConfig();
  res.json({
    success: result.valid,
    ...result
  });
});

/**
 * POST /api/ai-providers/generate
 * Generate content using active provider (for testing)
 */
router.post('/generate', async (req, res) => {
  const { prompt, options } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt required' });
  }

  const result = await aiProvider.generate(prompt, options || {});
  res.json(result);
});

module.exports = router;
