/**
 * LM Studio CLI Service
 *
 * Detects available models using the `lms` CLI tool.
 * Falls back gracefully if CLI is not installed.
 */

const { execSync } = require('child_process');

// Cache for model detection (refreshed on demand)
let cachedModels = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Check if lms CLI is available
 */
function isCliAvailable() {
  const result = execSync('which lms 2>/dev/null || echo ""', { encoding: 'utf8' });
  return result.trim().length > 0;
}

/**
 * Parse lms ls output into structured data
 */
function parseModelList(output) {
  const models = {
    llm: [],
    embedding: []
  };

  const lines = output.split('\n');
  let section = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    if (trimmed.startsWith('LLM')) {
      section = 'llm';
      continue;
    }
    if (trimmed.startsWith('EMBEDDING')) {
      section = 'embedding';
      continue;
    }

    // Skip empty lines and header separators
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('PARAMS')) {
      continue;
    }

    // Parse model line
    if (section && trimmed) {
      // Model lines have: NAME  PARAMS  ARCH  SIZE  [LOADED]
      const parts = trimmed.split(/\s{2,}/);
      if (parts.length >= 1) {
        const name = parts[0];
        const isLoaded = trimmed.includes('✓ LOADED') || trimmed.includes('LOADED');

        models[section].push({
          name: name.replace(/\s*\(.*\)/, '').trim(), // Remove "(1 variant)" etc
          params: parts[1] || null,
          arch: parts[2] || null,
          size: parts[3] || null,
          loaded: isLoaded
        });
      }
    }
  }

  return models;
}

/**
 * Parse lms ps output for loaded models
 */
function parseLoadedModels(output) {
  const loaded = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip header lines
    if (!trimmed || trimmed.startsWith('IDENTIFIER') || trimmed.startsWith('---')) {
      continue;
    }

    const parts = trimmed.split(/\s{2,}/);
    if (parts.length >= 2) {
      loaded.push({
        identifier: parts[0],
        model: parts[1],
        status: parts[2] || 'unknown',
        size: parts[3] || null,
        context: parts[4] || null
      });
    }
  }

  return loaded;
}

/**
 * Get all available models (downloaded)
 */
function getAvailableModels(forceRefresh = false) {
  // Check cache
  if (!forceRefresh && cachedModels && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedModels;
  }

  if (!isCliAvailable()) {
    return { available: false, error: 'lms CLI not found', llm: [], embedding: [] };
  }

  const output = execSync('lms ls 2>&1', { encoding: 'utf8' });
  const models = parseModelList(output);

  cachedModels = {
    available: true,
    ...models,
    timestamp: new Date().toISOString()
  };
  cacheTimestamp = Date.now();

  return cachedModels;
}

/**
 * Get currently loaded models
 */
function getLoadedModels() {
  if (!isCliAvailable()) {
    return { available: false, error: 'lms CLI not found', models: [] };
  }

  const output = execSync('lms ps 2>&1', { encoding: 'utf8' });
  const models = parseLoadedModels(output);

  return {
    available: true,
    models,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if a specific embedding model is available
 */
function hasEmbeddingModel(modelName = 'nomic-embed') {
  const models = getAvailableModels();

  if (!models.available) {
    return { available: false, reason: models.error };
  }

  const found = models.embedding.find(m =>
    m.name.toLowerCase().includes(modelName.toLowerCase())
  );

  return {
    available: !!found,
    model: found || null,
    reason: found ? 'Model found' : `No embedding model matching "${modelName}"`
  };
}

/**
 * Check if a specific embedding model is currently loaded
 */
function isEmbeddingModelLoaded(modelName = 'nomic-embed') {
  const loaded = getLoadedModels();

  if (!loaded.available) {
    return { loaded: false, reason: loaded.error };
  }

  const found = loaded.models.find(m =>
    m.identifier.toLowerCase().includes(modelName.toLowerCase()) ||
    m.model.toLowerCase().includes(modelName.toLowerCase())
  );

  return {
    loaded: !!found,
    model: found || null,
    status: found?.status || null
  };
}

/**
 * Get full status for embedding service
 */
function getEmbeddingStatus() {
  const cliAvailable = isCliAvailable();

  if (!cliAvailable) {
    return {
      cliAvailable: false,
      modelAvailable: false,
      modelLoaded: false,
      recommendation: 'Install LM Studio and the lms CLI for embedding support'
    };
  }

  const available = hasEmbeddingModel('nomic-embed');
  const loaded = isEmbeddingModelLoaded('nomic-embed');

  return {
    cliAvailable: true,
    modelAvailable: available.available,
    modelLoaded: loaded.loaded,
    model: available.model || loaded.model,
    recommendation: !available.available
      ? 'Download nomic-embed-text-v1.5 in LM Studio'
      : !loaded.loaded
        ? 'Load the embedding model in LM Studio server'
        : null
  };
}

module.exports = {
  isCliAvailable,
  getAvailableModels,
  getLoadedModels,
  hasEmbeddingModel,
  isEmbeddingModelLoaded,
  getEmbeddingStatus
};
