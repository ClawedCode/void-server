#!/bin/bash
# Run E2E tests with server-side code coverage
# Uses port 4450 to avoid conflicts with dev environment

set -e

COVERAGE_PORT=4450
COVERAGE_DIR="coverage/v8"
SERVER_PID_FILE="/tmp/void-coverage-server.pid"

cleanup() {
  if [ -f "$SERVER_PID_FILE" ]; then
    PID=$(cat "$SERVER_PID_FILE")
    echo "[COVERAGE] Stopping server (PID: $PID)..."
    kill -INT $PID 2>/dev/null || true
    sleep 2
    rm -f "$SERVER_PID_FILE"
  fi
}

trap cleanup EXIT

echo "[COVERAGE] Cleaning previous coverage data..."
rm -rf "$COVERAGE_DIR"
mkdir -p "$COVERAGE_DIR"

echo "[COVERAGE] Starting server with c8 on port $COVERAGE_PORT..."
PORT=$COVERAGE_PORT npx c8 --temp-directory="$COVERAGE_DIR" --include="server/**" node server/index.js &
SERVER_PID=$!
echo $SERVER_PID > "$SERVER_PID_FILE"

echo "[COVERAGE] Waiting for server to start..."
sleep 3

# Verify server is running
if ! curl -s "http://127.0.0.1:$COVERAGE_PORT/api/browsers" > /dev/null; then
  echo "[COVERAGE] ERROR: Server failed to start"
  exit 1
fi

echo "[COVERAGE] Server ready. Running tests..."
TEST_APP_URL="http://127.0.0.1:$COVERAGE_PORT" npm run test:native || true

echo "[COVERAGE] Tests complete. Stopping server..."
cleanup

echo "[COVERAGE] Generating coverage report..."
npm run test:coverage:report

echo "[COVERAGE] Done! View HTML report at coverage/index.html"
