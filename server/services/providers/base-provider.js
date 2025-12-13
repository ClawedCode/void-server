/**
 * Base AI Provider Class
 * All providers must extend this class and implement required methods
 */

class BaseProvider {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.type = config.type;
    this.enabled = config.enabled;
    this.timeout = config.timeout || 120000;
  }

  /**
   * Generate content from a prompt
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<{success: boolean, content?: string, error?: string}>}
   */
  async generate(prompt, options = {}) {
    throw new Error('generate() must be implemented by provider');
  }

  /**
   * Test connection to the provider
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by provider');
  }

  /**
   * Get available models for this provider
   * @returns {Promise<{success: boolean, models?: Array, error?: string}>}
   */
  async getModels() {
    return {
      success: true,
      models: Object.entries(this.config.models || {}).map(([type, model]) => ({
        type,
        model,
        description: this.getModelDescription(type)
      }))
    };
  }

  /**
   * Get model description by type
   */
  getModelDescription(type) {
    const descriptions = {
      light: 'Fast responses, lower cost (e.g. Haiku)',
      medium: 'Balanced performance (e.g. Sonnet)',
      deep: 'Maximum capability (e.g. Opus)'
    };
    return descriptions[type] || type;
  }

  /**
   * Get the model ID for a specific type
   */
  getModel(type = 'medium') {
    return this.config.models?.[type] || this.config.models?.medium;
  }

  /**
   * Validate the provider configuration
   * @returns {{valid: boolean, errors?: string[]}}
   */
  validateConfig() {
    const errors = [];

    if (!this.config.name) {
      errors.push('Provider name is required');
    }

    if (!this.config.type) {
      errors.push('Provider type is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

module.exports = BaseProvider;
