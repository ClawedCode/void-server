/**
 * Prompts REST API Routes
 * Manages templates and variables
 */

const express = require('express');
const router = express.Router();
const promptService = require('../services/prompt-service');
const promptExecutor = require('../services/prompt-executor');

// ============================================================================
// Template Routes
// ============================================================================

/**
 * GET /api/prompts/templates
 * List all templates
 */
router.get('/templates', (req, res) => {
  const templates = promptService.getTemplates();
  res.json({ success: true, templates });
});

/**
 * GET /api/prompts/templates/:id
 * Get a single template
 */
router.get('/templates/:id', (req, res) => {
  const template = promptService.getTemplate(req.params.id);

  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }

  res.json({ success: true, template });
});

/**
 * POST /api/prompts/templates
 * Create a new template
 */
router.post('/templates', (req, res) => {
  const result = promptService.createTemplate(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

/**
 * PUT /api/prompts/templates/:id
 * Update a template
 */
router.put('/templates/:id', (req, res) => {
  const result = promptService.updateTemplate(req.params.id, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * DELETE /api/prompts/templates/:id
 * Delete a template
 */
router.delete('/templates/:id', (req, res) => {
  const result = promptService.deleteTemplate(req.params.id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
});

/**
 * POST /api/prompts/templates/:id/test
 * Test a template with sample values
 */
router.post('/templates/:id/test', async (req, res) => {
  const { values, execute } = req.body;

  const result = await promptExecutor.testTemplate(req.params.id, values || {}, {
    execute: execute === true
  });

  res.json(result);
});

/**
 * POST /api/prompts/templates/validate
 * Validate template syntax
 */
router.post('/templates/validate', (req, res) => {
  const { template } = req.body;

  if (!template) {
    return res.status(400).json({ success: false, error: 'Template content required' });
  }

  const result = promptService.validateTemplate(template);
  res.json({ success: true, ...result });
});

// ============================================================================
// Variable Routes
// ============================================================================

/**
 * GET /api/prompts/variables
 * List all variables
 */
router.get('/variables', (req, res) => {
  const variables = promptService.getVariables();
  res.json({ success: true, variables });
});

/**
 * GET /api/prompts/variables/usage
 * Get variable usage across templates
 */
router.get('/variables/usage', (req, res) => {
  const usage = promptService.getVariableUsage();
  res.json({ success: true, usage });
});

/**
 * GET /api/prompts/variables/:id
 * Get a single variable
 */
router.get('/variables/:id', (req, res) => {
  const variable = promptService.getVariable(req.params.id);

  if (!variable) {
    return res.status(404).json({ success: false, error: 'Variable not found' });
  }

  res.json({ success: true, variable });
});

/**
 * POST /api/prompts/variables
 * Create a new variable
 */
router.post('/variables', (req, res) => {
  const result = promptService.createVariable(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

/**
 * PUT /api/prompts/variables/:id
 * Update a variable
 */
router.put('/variables/:id', (req, res) => {
  const result = promptService.updateVariable(req.params.id, req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * DELETE /api/prompts/variables/:id
 * Delete a variable
 */
router.delete('/variables/:id', (req, res) => {
  const result = promptService.deleteVariable(req.params.id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// ============================================================================
// Execution Routes
// ============================================================================

/**
 * POST /api/prompts/execute
 * Execute a template with variables
 */
router.post('/execute', async (req, res) => {
  const { templateId, variables, providerOverride, modelType, settings } = req.body;

  if (!templateId) {
    return res.status(400).json({ success: false, error: 'templateId required' });
  }

  const result = await promptExecutor.executePrompt(templateId, variables || {}, {
    providerOverride,
    modelType,
    settings
  });

  res.json(result);
});

/**
 * GET /api/prompts/providers
 * Get available providers for template configuration
 */
router.get('/providers', (req, res) => {
  const providers = promptExecutor.getAvailableProviders();
  res.json({ success: true, providers });
});

module.exports = router;
