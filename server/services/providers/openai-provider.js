/**
 * OpenAI-Compatible API Provider
 * Works with OpenAI, LM Studio, and other OpenAI-compatible APIs
 */

const BaseProvider = require('./base-provider');
const http = require('../../lib/http-client');

class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.endpoint = config.endpoint || 'https://api.openai.com/v1';
    this.apiKey = config.apiKey || '';
    this.settings = config.settings || {};
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async generate(prompt, options = {}) {
    const modelType = options.modelType || 'default';
    const model = this.getModel(modelType);

    const messages = options.messages || [
      { role: 'user', content: prompt }
    ];

    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const body = {
      model,
      messages,
      temperature: options.temperature ?? this.settings.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? this.settings.max_tokens ?? 4096,
      ...(this.settings.top_p && { top_p: this.settings.top_p }),
      ...(this.settings.frequency_penalty && { frequency_penalty: this.settings.frequency_penalty }),
      ...(this.settings.presence_penalty && { presence_penalty: this.settings.presence_penalty })
    };

    const startTime = Date.now();

    const result = await http.post(`${this.endpoint}/chat/completions`, {
      headers: this.getHeaders(),
      body,
      timeout: this.timeout
    });

    const duration = Date.now() - startTime;

    if (!result.ok) {
      return {
        success: false,
        error: result.data?.error?.message || `API error: ${result.status}`,
        duration
      };
    }

    const content = result.data?.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: 'No content in response',
        duration
      };
    }

    return {
      success: true,
      content,
      model,
      duration,
      usage: result.data?.usage
    };
  }

  async testConnection() {
    // Try to list models as a connection test
    const result = await http.get(`${this.endpoint}/models`, {
      headers: this.getHeaders(),
      timeout: 10000
    });

    if (!result.ok) {
      // For local servers that don't support /models, try a simple completion
      if (result.status === 404) {
        return this.testWithCompletion();
      }

      return {
        success: false,
        error: result.data?.error?.message || `Connection failed: ${result.status}`
      };
    }

    const modelCount = result.data?.data?.length || 0;
    return {
      success: true,
      message: `Connected to ${this.name} (${modelCount} models available)`
    };
  }

  async testWithCompletion() {
    const result = await this.generate('Say "test successful" in exactly those words.', {
      modelType: 'quick',
      max_tokens: 20
    });

    if (result.success) {
      return {
        success: true,
        message: `Connected to ${this.name} (completion test passed)`
      };
    }

    return {
      success: false,
      error: result.error || 'Connection test failed'
    };
  }

  async getModels() {
    const result = await http.get(`${this.endpoint}/models`, {
      headers: this.getHeaders(),
      timeout: 10000
    });

    if (!result.ok) {
      // Return configured models if API doesn't support listing
      return super.getModels();
    }

    const apiModels = result.data?.data?.map(m => ({
      id: m.id,
      name: m.id,
      owned_by: m.owned_by
    })) || [];

    return {
      success: true,
      models: apiModels,
      configured: Object.entries(this.config.models || {}).map(([type, model]) => ({
        type,
        model,
        description: this.getModelDescription(type)
      }))
    };
  }

  validateConfig() {
    const base = super.validateConfig();
    const errors = base.errors || [];

    if (!this.endpoint) {
      errors.push('API endpoint is required');
    }

    // API key is optional for local servers like LM Studio
    if (this.endpoint.includes('openai.com') && !this.apiKey) {
      errors.push('API key is required for OpenAI');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

module.exports = OpenAIProvider;
