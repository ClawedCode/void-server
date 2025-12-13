/**
 * HTTP Client - Centralized HTTP request helper with logging
 *
 * All outbound network requests from void-server and plugins should use this
 * helper to ensure consistent logging and monitoring of external API calls.
 *
 * Usage:
 *   const http = require('void-server/server/lib/http-client');
 *   const data = await http.get('https://api.example.com/data');
 *   const result = await http.post('https://api.example.com/submit', { body: { foo: 'bar' } });
 */

const LOG_PREFIX = '🌐';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

/**
 * Format duration in human-readable form
 */
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Get color for HTTP status code
 */
const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.yellow;
  return colors.red;
};

/**
 * Log an outbound HTTP request
 */
const logRequest = (method, url, options = {}) => {
  const urlObj = new URL(url);
  const host = urlObj.host;
  const path = urlObj.pathname + urlObj.search;

  console.log(
    `${LOG_PREFIX} ${colors.cyan}${method}${colors.reset} ${colors.dim}${host}${colors.reset}${path}`
  );
};

/**
 * Log an HTTP response
 */
const logResponse = (method, url, status, duration, error = null) => {
  const urlObj = new URL(url);
  const host = urlObj.host;
  const path = urlObj.pathname.length > 40
    ? urlObj.pathname.slice(0, 40) + '...'
    : urlObj.pathname;

  const statusColor = error ? colors.red : getStatusColor(status);
  const statusText = error ? 'ERR' : status;

  console.log(
    `${LOG_PREFIX} ${colors.cyan}${method}${colors.reset} ${colors.dim}${host}${colors.reset}${path} ` +
    `${statusColor}${statusText}${colors.reset} ${colors.dim}(${formatDuration(duration)})${colors.reset}`
  );
};

/**
 * Make an HTTP request with logging
 *
 * @param {string} url - The URL to request
 * @param {Object} options - Fetch options plus extensions
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.headers - Request headers
 * @param {Object|string} options.body - Request body (objects are JSON-stringified)
 * @param {number} options.timeout - Request timeout in ms (default: 30000)
 * @param {boolean} options.json - Parse response as JSON (default: true)
 * @param {boolean} options.silent - Don't log this request (default: false)
 * @returns {Promise<any>} Response data
 */
const request = async (url, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    json = true,
    silent = false,
    ...fetchOptions
  } = options;

  const startTime = Date.now();

  // Prepare headers
  const requestHeaders = { ...headers };
  if (body && typeof body === 'object' && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Prepare body
  const requestBody = body && typeof body === 'object'
    ? JSON.stringify(body)
    : body;

  // Log outbound request
  if (!silent) {
    logRequest(method, url, options);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response;
  let data;

  const fetchOpts = {
    method,
    headers: requestHeaders,
    signal: controller.signal,
    ...fetchOptions
  };

  if (requestBody && method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = requestBody;
  }

  response = await fetch(url, fetchOpts);
  clearTimeout(timeoutId);

  const duration = Date.now() - startTime;

  // Log response
  if (!silent) {
    logResponse(method, url, response.status, duration);
  }

  // Parse response
  if (json) {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } else {
    data = await response.text();
  }

  // Attach response metadata
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    data
  };
};

/**
 * GET request helper
 */
const get = (url, options = {}) =>
  request(url, { ...options, method: 'GET' });

/**
 * POST request helper
 */
const post = (url, options = {}) =>
  request(url, { ...options, method: 'POST' });

/**
 * PUT request helper
 */
const put = (url, options = {}) =>
  request(url, { ...options, method: 'PUT' });

/**
 * PATCH request helper
 */
const patch = (url, options = {}) =>
  request(url, { ...options, method: 'PATCH' });

/**
 * DELETE request helper
 */
const del = (url, options = {}) =>
  request(url, { ...options, method: 'DELETE' });

/**
 * Convenience method for JSON POST
 */
const postJson = (url, body, options = {}) =>
  post(url, { ...options, body });

/**
 * Convenience method for fetching JSON data
 */
const getJson = async (url, options = {}) => {
  const result = await get(url, options);
  return result.data;
};

module.exports = {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
  postJson,
  getJson,
  // Export for testing/extension
  logRequest,
  logResponse
};
