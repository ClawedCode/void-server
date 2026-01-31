# Testing & Coverage

## E2E (Docker)

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
