# HTTP Client

Centralized HTTP request helper for void-server with automatic logging of all outbound network traffic.

## Overview

All plugins and server code making external HTTP requests should use this helper to ensure:
- Consistent logging of outbound network traffic
- Standardized error handling
- Request timeout management
- Visibility into external API dependencies

## Installation

The HTTP client is built into void-server. No additional installation required.

## Usage

### Basic Import

```javascript
const http = require('../../server/lib/http-client');

// Or from plugin context, use relative path from your plugin:
const http = require('../../../server/lib/http-client');
```

### GET Request

```javascript
// Simple GET (returns { ok, status, data })
const result = await http.get('https://api.example.com/users');
if (result.ok) {
  console.log(result.data);
}

// Get JSON data directly
const users = await http.getJson('https://api.example.com/users');
```

### POST Request

```javascript
// POST with JSON body
const result = await http.post('https://api.example.com/users', {
  body: { name: 'John', email: 'john@example.com' }
});

// Convenience method
const result = await http.postJson('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com'
});
```

### Other Methods

```javascript
// PUT
await http.put('https://api.example.com/users/1', {
  body: { name: 'Updated' }
});

// PATCH
await http.patch('https://api.example.com/users/1', {
  body: { name: 'Patched' }
});

// DELETE
await http.delete('https://api.example.com/users/1');
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | 'GET' | HTTP method |
| `headers` | object | {} | Request headers |
| `body` | object/string | - | Request body (auto JSON-stringified if object) |
| `timeout` | number | 30000 | Request timeout in milliseconds |
| `json` | boolean | true | Parse response as JSON |
| `silent` | boolean | false | Disable logging for this request |

### Custom Headers

```javascript
const result = await http.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  }
});
```

### Timeout

```javascript
// 5 second timeout
const result = await http.get('https://slow-api.example.com/data', {
  timeout: 5000
});
```

### Silent Mode

For high-frequency polling or internal requests where logging would be too noisy:

```javascript
const result = await http.get('https://api.example.com/health', {
  silent: true
});
```

### Raw Text Response

```javascript
const result = await http.get('https://example.com/page.html', {
  json: false
});
console.log(result.data); // HTML string
```

## Response Format

All methods return an object with:

```javascript
{
  ok: true,           // true if status 200-299
  status: 200,        // HTTP status code
  statusText: 'OK',   // Status text
  headers: {},        // Response headers
  data: {}            // Parsed response body (JSON or text)
}
```

## Logging Output

All requests are logged to the console with:
- HTTP method
- Host and path
- Response status code
- Request duration

Example output:
```
🌐 GET api.solana.com/rpc 200 (142ms)
🌐 POST quote-api.jup.ag/v6/quote 200 (856ms)
🌐 GET api.example.com/users 404 (234ms)
```

## Error Handling

Network errors and timeouts will throw. Handle them appropriately:

```javascript
const result = await http.get('https://api.example.com/data');

if (!result.ok) {
  console.error(`API error: ${result.status} ${result.statusText}`);
  return;
}

// Process result.data
```

## Best Practices

1. **Always use this helper** for external HTTP requests in plugins
2. **Set appropriate timeouts** for slow APIs
3. **Use `silent: true`** for health checks and frequent polling
4. **Check `result.ok`** before processing response data
5. **Handle errors gracefully** - don't let external API failures crash your plugin

## Migration Guide

### From native fetch

```javascript
// Before
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// After
const http = require('../../server/lib/http-client');
const data = await http.getJson('https://api.example.com/data');
```

### From axios

```javascript
// Before
const axios = require('axios');
const { data } = await axios.post('https://api.example.com/submit', { foo: 'bar' });

// After
const http = require('../../server/lib/http-client');
const result = await http.postJson('https://api.example.com/submit', { foo: 'bar' });
const data = result.data;
```
