# Style Guide

Code conventions and standards for void-server development.

## General Rules

- **No hardcoded colors** - use CSS variables (`var(--color-primary)`) or Tailwind theme classes (`text-primary`)
- **No `window.alert`** - use `toast` from react-hot-toast
- **No `window.confirm`** - use inline confirmation modals
- **No try/catch** where avoidable - let errors propagate naturally
- **Functional components** - prefer functions over classes
- **Responsive design** - use Tailwind responsive prefixes (sm:, md:, lg:)
- **Test IDs** - add `data-testid` attributes to interactive elements

## Theme System

See [THEME.md](THEME.md) for complete theme documentation including CSS variables, Tailwind classes, and utility classes.

## Server Logging Format

All server logs use a single-line interpolated format with emoji icons:

```javascript
// Format: emoji + context info on single line
console.log(`📋 GET /api/endpoint param=${value}`);
console.log(`✅ Success message with ${count} items`);
console.log(`❌ Error: ${error.message}`);
```

### Emoji Conventions

| Emoji | Usage |
|-------|-------|
| `📋` | List/fetch operations |
| `👛` | Wallet operations |
| `🪙` | Token operations |
| `🔑` | Key/derivation operations |
| `🔐` | Seed/secret operations |
| `➕` | Create operations |
| `📥` | Import operations |
| `🗑️` | Delete operations |
| `✏️` | Update/edit operations |
| `💸` | Transaction/send operations |
| `✍️` | Sign operations |
| `🔄` | Refresh/sync operations |
| `✅` | Success result |
| `❌` | Error result |
| `⚠️` | Warning |
| `🚀` | Startup/init |
| `🔌` | Plugin/connection |

## Available Icons

Icons from `lucide-react`. Import as needed:

```jsx
import { Home, Box, Settings, Check, X } from 'lucide-react';
```

### Common Icons

| Category | Icons |
|----------|-------|
| Navigation | `Home`, `Box`, `FileText`, `Settings` |
| Actions | `Copy`, `Download`, `RefreshCw`, `Trash2`, `Edit` |
| Status | `Check`, `X`, `AlertTriangle`, `Info` |
| Media | `Play`, `Pause`, `Volume2`, `Music` |

## Component Patterns

### Page Header
```jsx
<div className="flex items-center gap-3">
  <Icon className="w-8 h-8 text-primary" />
  <div>
    <h1 className="text-2xl font-bold text-text-primary">Page Title</h1>
    <p className="text-secondary text-sm">Page description</p>
  </div>
</div>
```

### Card
```jsx
<div className="card space-y-4">
  <h2 className="text-lg font-semibold text-text-primary">Section</h2>
  {/* content */}
</div>
```

### Form Elements
```jsx
<input className="form-input w-full" placeholder="Input..." />
<button className="btn btn-primary">Action</button>
```

### Toast Notifications
```jsx
import toast from 'react-hot-toast';

toast.success('Operation completed');
toast.error('Something went wrong');
toast.loading('Processing...', { id: 'unique-id' });
toast.dismiss('unique-id');
```
