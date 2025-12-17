# Plugin Development

Guide for developing void-server plugins.

## Plugin Structure

```
void-plugin-example/
├── client/
│   ├── index.jsx              # Client entry + exports
│   └── pages/
│       └── ExamplePage.jsx    # Page components
├── server/
│   └── index.js               # Express routes
├── manifest.json              # Plugin metadata
├── package.json
└── README.md
```

## manifest.json

```json
{
  "name": "void-plugin-example",
  "version": "1.0.0",
  "description": "Example plugin description",
  "server": {
    "entry": "server/index.js"
  },
  "client": {
    "entry": "client/index.jsx",
    "routes": [
      {
        "path": "",
        "component": "ExamplePage",
        "title": "Example"
      }
    ]
  },
  "nav": {
    "section": null,
    "title": "Example",
    "icon": "box"
  },
  "defaultMountPath": "/example",
  "dependencies": {
    "runtime": ["react-hot-toast", "lucide-react"]
  }
}
```

## Client Entry (index.jsx)

```jsx
export { default as ExamplePage } from './pages/ExamplePage';

export const routes = [
  { path: '', component: 'ExamplePage', title: 'Example' }
];

export const defaultNav = {
  section: null,
  title: 'Example',
  icon: 'box'
};

export const componentMap = {
  ExamplePage: () => import('./pages/ExamplePage')
};
```

## Example Page Component

```jsx
import { Box } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamplePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Box className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Page Title</h1>
          <p className="text-secondary text-sm">Page description</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Section</h2>
        <input className="form-input w-full" placeholder="Input..." />
        <button className="btn btn-primary">Action</button>
      </div>
    </div>
  );
}
```

## Plugin Data Storage

**Important:** Do NOT store user data inside the plugin directory. Use `data/<plugin-name>/` in the main app directory instead.

```javascript
// In plugin server/index.js
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../../data/my-plugin');

// Create on demand when writing
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
```

This ensures:
- User data persists across plugin updates
- Docker volume mounting works correctly
- Backups include plugin data

## Server Routes

```javascript
// server/index.js
const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.post('/action', (req, res) => {
  const { param } = req.body;
  // Handle action
  res.json({ success: true });
});

module.exports = router;
```

## Plugin Locations

| Type | Location | Notes |
|------|----------|-------|
| Core plugins | `plugins/` | Shipped with void-server |
| User plugins | `data/plugins/` | Installed via UI, persists in Docker |
| Plugin data | `data/<plugin-name>/` | User data for any plugin |

## Available Runtime Dependencies

Plugins can use these without bundling:
- `react`, `react-dom`
- `react-router-dom`
- `react-hot-toast`
- `lucide-react`

Declare in manifest.json:
```json
{
  "dependencies": {
    "runtime": ["react-hot-toast", "lucide-react"]
  }
}
```
