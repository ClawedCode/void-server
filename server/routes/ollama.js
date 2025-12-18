/**
 * Ollama Routes
 *
 * REST endpoints for Ollama model management
 */

const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollama-service');

/**
 * GET /api/ollama/status
 * Get Ollama service status
 */
router.get('/status', async (req, res) => {
  const status = await ollamaService.getStatus();
  res.json(status);
});

/**
 * GET /api/ollama/models
 * List available models
 */
router.get('/models', async (req, res) => {
  const result = await ollamaService.listModels();
  res.json(result);
});

/**
 * POST /api/ollama/pull
 * Pull a model from the Ollama registry (streaming)
 */
router.post('/pull', async (req, res) => {
  const { model } = req.body;
  if (!model) {
    return res.status(400).json({ error: 'Model name required' });
  }

  // Set up SSE for streaming progress
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await ollamaService.pullModel(model, (progress) => {
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

/**
 * DELETE /api/ollama/models/:name
 * Delete a model
 */
router.delete('/models/:name', async (req, res) => {
  const modelName = req.params.name;
  const result = await ollamaService.deleteModel(modelName);
  res.json(result);
});

/**
 * GET /api/ollama/lm-studio/models
 * List available GGUF models from LM Studio directory
 */
router.get('/lm-studio/models', (req, res) => {
  const result = ollamaService.listLmStudioModels();
  res.json(result);
});

/**
 * POST /api/ollama/lm-studio/import
 * Import a GGUF model from LM Studio into Ollama (streaming)
 */
router.post('/lm-studio/import', async (req, res) => {
  const { path: ggufPath, name } = req.body;

  if (!ggufPath) {
    return res.status(400).json({ error: 'GGUF path required' });
  }

  // Generate a model name if not provided
  const modelName = name || ggufPath.split('/').pop().replace('.gguf', '').toLowerCase();

  // Set up SSE for streaming progress
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const result = await ollamaService.importFromLmStudio(ggufPath, modelName, (progress) => {
    res.write(`data: ${JSON.stringify(progress)}\n\n`);
  });

  if (!result.success) {
    res.write(`data: ${JSON.stringify({ error: result.error })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true, name: modelName })}\n\n`);
  res.end();
});

module.exports = router;
