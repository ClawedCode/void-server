# Testing & Coverage

## Quick Reference

```bash
# Native mode (development)
npm run test:coverage           # Full E2E with coverage report

# Docker mode
npm run test:docker             # Full E2E in Docker
npm run test:docker:api         # API-only (no browser)

# Coverage report
npm run test:coverage:report    # Generate HTML report from V8 data
```

## E2E Tests (Native)

Native mode runs tests against a locally running server.

1) Start the server (if not running):
```bash
npm start
```

2) Run E2E tests:
```bash
npm run test:native
```

## E2E Tests (Docker)

Docker mode runs tests against the full containerized stack.

1) Start the test stack:
```bash
bash scripts/test-env.sh start docker
```

2) Run the E2E suite:
```bash
npm run test:docker
```

If your environment cannot launch a browser (CI/sandbox), run the API-only subset:
```bash
npm run test:docker:api
```

3) Stop the stack when done:
```bash
bash scripts/test-env.sh stop docker
```

## Coverage (Native)

Run E2E tests with server-side code coverage:

```bash
npm run test:coverage
```

This:
1. Starts the server with c8 on port 4450 (isolated from dev environment)
2. Runs the full E2E test suite
3. Generates coverage report

Outputs:
- Text summary in the terminal
- HTML report at `coverage/index.html`

## Coverage (Docker E2E)

The server writes V8 coverage data to `coverage/v8` during Docker E2E runs.

1) Run the Docker E2E tests (above).
2) Generate a report:

```bash
npm run test:coverage:report
```

Notes:
- Coverage reflects server-side Node.js execution during E2E tests.
- The report command remaps Docker paths (e.g., `/app/...`) to your local repo before generating coverage.

## Test Tags

Tests can be filtered using Cucumber tags:

| Tag | Description |
|-----|-------------|
| `@api` | API-only tests (no browser) |
| `@requires-neo4j` | Requires Neo4j connection |
| `@requires-ipfs` | Requires IPFS daemon |
| `@requires-docker` | Requires Docker environment |

Run tagged tests:
```bash
npm run test:native -- --tags "@api"
npm run test:native -- --tags "not @requires-neo4j"
```

## Test Structure

```
tests/e2e/
├── features/           # Gherkin feature files
│   ├── backup/         # Backup/restore tests
│   ├── core/           # Dashboard, settings
│   ├── chat/           # Chat system
│   ├── federation/     # Federation, peers, security hardening
│   ├── memories/       # Memory CRUD, graph
│   ├── plugins/        # Plugin management
│   └── wallet/         # Wallet operations
├── steps/              # Step definitions
├── pages/              # Page Object Models
├── mocks/              # Mock services
├── fixtures/           # Test data
└── support/            # Test utilities
```

## Current Coverage

| Metric | Coverage |
|--------|----------|
| Statements | ~51% |
| Branches | ~57% |
| Functions | ~47% |

Target: 70% statements, 65% branches, 60% functions

See `docs/TEST-COVERAGE-GAPS.md` for detailed analysis.

## CI/CD

- **PR checks**: Lint + build validation
- **Coverage workflow**: Runs on push to main, generates reports
- **Release testing**: E2E tests run locally before version tags
