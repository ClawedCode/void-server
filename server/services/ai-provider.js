/**
 * AI Provider Factory and Base Provider
 * Manages multiple AI providers with a unified interface
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '../../config');
const AI_PROVIDERS_CONFIG_PATH = path.join(CONFIG_DIR, 'ai-providers.json');

// Default configuration
const DEFAULT_CONFIG = {
  activeProvider: 'claude',
  providers: {
    claude: {
      name: 'Claude',
      type: 'cli',
      enabled: true,
      command: 'claude',
      models: {
        light: 'haiku',
        medium: 'sonnet',
        deep: 'opus'
      },
      timeout: 300000
    },
    openai: {
      name: 'OpenAI',
      type: 'api',
      enabled: false,
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      models: {
        light: 'gpt-4o-mini',
        medium: 'gpt-4o',
        deep: 'gpt-4o'
      },
      settings: {
        temperature: 0.7,
        max_tokens: 4096
      },
      timeout: 120000
    },
    anthropic: {
      name: 'Anthropic API',
      type: 'api',
      enabled: false,
      endpoint: 'https://api.anthropic.com/v1',
      apiKey: '',
      models: {
        light: 'claude-haiku-4-20250514',
        medium: 'claude-sonnet-4-20250514',
        deep: 'claude-opus-4-20250514'
      },
      settings: {
        temperature: 0.7,
        max_tokens: 4096
      },
      timeout: 120000
    },
    lmstudio: {
      name: 'LM Studio',
      type: 'api',
      enabled: false,
      endpoint: 'http://localhost:1234/v1',
      apiKey: 'lm-studio',
      models: {
        light: 'lmstudio-community/Llama-3.2-3B-Instruct-GGUF',
        medium: 'lmstudio-community/Qwen2.5-14B-Instruct-GGUF',
        deep: 'openai/gpt-oss-20b'
      },
      settings: {
        temperature: 0.8,
        max_tokens: 8192
      },
      timeout: 300000
    }
  }
};

// Provider instances
const providers = new Map();
let config = null;

/**
 * Load configuration from disk
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(AI_PROVIDERS_CONFIG_PATH)) {
    // Create default config
    fs.writeFileSync(AI_PROVIDERS_CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    config = { ...DEFAULT_CONFIG };
  } else {
    const saved = JSON.parse(fs.readFileSync(AI_PROVIDERS_CONFIG_PATH, 'utf8'));
    // Merge with defaults to ensure new providers are available
    config = {
      ...DEFAULT_CONFIG,
      ...saved,
      providers: {
        ...DEFAULT_CONFIG.providers,
        ...saved.providers
      }
    };
  }

  return config;
}

/**
 * Save configuration to disk
 */
function saveConfig() {
  if (!config) return;
  fs.writeFileSync(AI_PROVIDERS_CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * Get all providers configuration
 */
function getProviders() {
  if (!config) loadConfig();

  const result = {};
  for (const [key, providerConfig] of Object.entries(config.providers)) {
    result[key] = {
      ...providerConfig,
      active: key === config.activeProvider,
      // Mask API key for security
      apiKey: providerConfig.apiKey ? '••••••••' : ''
    };
  }

  return {
    activeProvider: config.activeProvider,
    providers: result
  };
}

/**
 * Get active provider configuration
 */
function getActiveProvider() {
  if (!config) loadConfig();
  const providerKey = config.activeProvider;
  return {
    key: providerKey,
    ...config.providers[providerKey]
  };
}

/**
 * Switch active provider
 */
function switchProvider(providerKey) {
  if (!config) loadConfig();

  if (!config.providers[providerKey]) {
    return { success: false, error: `Provider "${providerKey}" not found` };
  }

  if (!config.providers[providerKey].enabled) {
    return { success: false, error: `Provider "${providerKey}" is disabled` };
  }

  config.activeProvider = providerKey;
  saveConfig();

  return {
    success: true,
    activeProvider: providerKey,
    message: `Switched to ${config.providers[providerKey].name}`
  };
}

/**
 * Update provider configuration
 */
function updateProviderConfig(providerKey, updates) {
  if (!config) loadConfig();

  if (!config.providers[providerKey]) {
    return { success: false, error: `Provider "${providerKey}" not found` };
  }

  // Merge updates (don't overwrite apiKey with masked value)
  const currentConfig = config.providers[providerKey];

  if (updates.apiKey === '••••••••' || updates.apiKey === '') {
    delete updates.apiKey;
  }

  config.providers[providerKey] = {
    ...currentConfig,
    ...updates,
    // Deep merge for nested objects
    models: { ...currentConfig.models, ...(updates.models || {}) },
    settings: { ...currentConfig.settings, ...(updates.settings || {}) }
  };

  saveConfig();

  // Re-register provider if it was updated
  registerProvider(providerKey);

  return {
    success: true,
    provider: providerKey,
    message: `Updated ${config.providers[providerKey].name} configuration`
  };
}

/**
 * Register a single provider
 */
function registerProvider(providerKey) {
  if (!config) loadConfig();

  const providerConfig = config.providers[providerKey];
  if (!providerConfig || !providerConfig.enabled) {
    providers.delete(providerKey);
    return;
  }

  // Load provider implementation based on type
  let ProviderClass;

  switch (providerKey) {
    case 'claude':
      ProviderClass = require('./providers/claude-provider');
      break;
    case 'openai':
    case 'lmstudio':
      ProviderClass = require('./providers/openai-provider');
      break;
    case 'anthropic':
      ProviderClass = require('./providers/anthropic-provider');
      break;
    default:
      console.log(`⚠️ Unknown provider type: ${providerKey}`);
      return;
  }

  providers.set(providerKey, new ProviderClass(providerConfig));
  console.log(`🤖 Registered AI provider: ${providerConfig.name}`);
}

/**
 * Register all enabled providers
 */
function registerProviders() {
  if (!config) loadConfig();

  providers.clear();

  for (const providerKey of Object.keys(config.providers)) {
    registerProvider(providerKey);
  }
}

/**
 * Test provider connection
 */
async function testProvider(providerKey) {
  if (!config) loadConfig();

  const providerConfig = config.providers[providerKey];
  if (!providerConfig) {
    return { success: false, error: `Provider "${providerKey}" not found` };
  }

  const provider = providers.get(providerKey);
  if (!provider) {
    return { success: false, error: `Provider "${providerKey}" not registered (may be disabled)` };
  }

  return provider.testConnection();
}

/**
 * Generate content using active provider
 */
async function generate(prompt, options = {}) {
  if (!config) loadConfig();

  const providerKey = config.activeProvider;
  const provider = providers.get(providerKey);

  if (!provider) {
    throw new Error(`Active provider "${providerKey}" not available`);
  }

  return provider.generate(prompt, options);
}

/**
 * Get provider instance
 */
function getProvider(providerKey) {
  return providers.get(providerKey || config?.activeProvider);
}

/**
 * Initialize the AI provider system
 */
function initialize() {
  loadConfig();
  registerProviders();
  console.log(`🤖 AI Provider system initialized (active: ${config.activeProvider})`);
}

module.exports = {
  initialize,
  loadConfig,
  saveConfig,
  getProviders,
  getActiveProvider,
  switchProvider,
  updateProviderConfig,
  testProvider,
  generate,
  getProvider,
  registerProviders
};
