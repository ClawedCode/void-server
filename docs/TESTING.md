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

## Coverage (Server-side, Docker E2E)

The server writes V8 coverage data to `coverage/v8` during Docker E2E runs.

1) Run the Docker E2E tests (above).
2) Generate a report:

```bash
npm run test:coverage:report
```

Outputs:
- Text summary in the terminal.
- HTML report at `coverage/index.html`.

Notes:
- Coverage reflects server-side Node.js execution during E2E tests.
- The report command remaps Docker paths (e.g., `/app/...`) to your local repo before generating coverage.
- If you want coverage for native runs, start the server with `NODE_V8_COVERAGE=coverage/v8` and then generate the report the same way.
