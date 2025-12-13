/**
 * Claude CLI Provider
 * Uses the Claude CLI tool for generation
 */

const { spawn } = require('child_process');
const BaseProvider = require('./base-provider');

class ClaudeProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.command = config.command || 'claude';
  }

  async generate(prompt, options = {}) {
    const modelType = options.modelType || 'default';
    const model = this.getModel(modelType);

    return new Promise((resolve) => {
      const args = ['--print'];

      if (model && model !== 'default') {
        args.push('--model', model);
      }

      args.push('-p', prompt);

      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const proc = spawn(this.command, args, {
        timeout: this.timeout,
        env: { ...process.env }
      });

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to spawn Claude CLI: ${error.message}`
        });
      });

      proc.on('close', (code) => {
        const duration = Date.now() - startTime;

        if (code !== 0) {
          resolve({
            success: false,
            error: stderr || `Claude CLI exited with code ${code}`,
            duration
          });
          return;
        }

        resolve({
          success: true,
          content: stdout.trim(),
          model,
          duration
        });
      });
    });
  }

  async testConnection() {
    return new Promise((resolve) => {
      const proc = spawn(this.command, ['--version'], {
        timeout: 10000
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (error) => {
        resolve({
          success: false,
          error: `Claude CLI not found: ${error.message}`
        });
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: stderr || 'Claude CLI test failed'
          });
          return;
        }

        resolve({
          success: true,
          message: `Claude CLI available: ${stdout.trim()}`
        });
      });
    });
  }

  validateConfig() {
    const base = super.validateConfig();
    const errors = base.errors || [];

    if (!this.command) {
      errors.push('CLI command is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

module.exports = ClaudeProvider;
