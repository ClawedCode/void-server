# Contributing to void-server

## Development Setup

```bash
# Fork the repo on GitHub first, then clone your fork
git clone https://github.com/YOUR-USERNAME/void-server.git
cd void-server

# Add upstream remote for syncing
git remote add upstream https://github.com/ClawedCode/void-server.git

# Install dependencies
npm install
cd client && npm install && cd ..

# Install git hooks (linting + secret scanning)
bash .githooks/install-hooks.sh

# Start development server
npm start
```

## Code Quality

### Pre-commit Hook
The pre-commit hook automatically runs:
1. **Secret scanning** - blocks commits containing API keys, passwords, etc.
2. **ESLint** - blocks commits with lint errors in `client/src/`

### Running Lint Manually
```bash
cd client && npm run lint
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure lint passes (`cd client && npm run lint`)
5. Commit your changes (pre-commit hook will validate)
6. Push to your fork
7. Open a PR to `main`

### PR Checks
All PRs automatically run:
- **Lint** - ESLint validation
- **Build** - Ensures client compiles

## Code Conventions

- **No hardcoded colors** - use CSS variables or Tailwind theme classes
- **No `window.alert`** - use `toast` from react-hot-toast
- **Functional components** - prefer functions over classes
- **No try/catch** where avoidable - let errors propagate

See [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md) for detailed coding standards.

## Release Process

Releases are managed by maintainers:
1. Changes are committed to `main`
2. E2E tests run locally before release
3. Version tagged (`git tag v0.x.x`)
4. Tag push triggers Docker build and GitHub release

## Questions?

Open an issue for questions or suggestions.
