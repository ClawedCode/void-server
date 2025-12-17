#!/bin/bash
# Start void-server via Docker and open browser when ready
#
# Usage:
#   ./docker-start.sh          # Pull latest image from registry
#   ./docker-start.sh --build  # Build from local source

set -e

APP_URL="http://localhost:4420"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configure Docker GID for browser sidecar support
configure_docker_gid() {
  if [[ -S /var/run/docker.sock ]]; then
    local docker_gid
    # Linux: use stat -c, macOS: use stat -f
    if stat --version &>/dev/null 2>&1; then
      docker_gid=$(stat -c '%g' /var/run/docker.sock)
    else
      docker_gid=$(stat -f '%g' /var/run/docker.sock)
    fi

    # Update .env file with DOCKER_GID
    if [[ -f .env ]]; then
      if grep -q "^DOCKER_GID=" .env; then
        sed -i.bak "s/^DOCKER_GID=.*/DOCKER_GID=$docker_gid/" .env && rm -f .env.bak
      else
        echo "DOCKER_GID=$docker_gid" >> .env
      fi
    else
      echo "DOCKER_GID=$docker_gid" > .env
    fi
    echo "🔧 Docker socket GID: $docker_gid (browser sidecar enabled)"
  fi
}

# Configure Docker GID
configure_docker_gid

if [[ "$1" == "--build" ]]; then
    echo "🔨 Building from local source..."
    docker compose build
else
    echo "📥 Pulling latest images..."
    docker compose pull
fi

echo "🐳 Starting void-server containers..."
docker compose up -d

echo "⏳ Waiting for void-server to be healthy..."
until docker inspect --format='{{.State.Health.Status}}' void-server 2>/dev/null | grep -q "healthy"; do
    sleep 2
    printf "."
done
echo ""

echo "✅ void-server is ready!"
echo "🌐 Opening $APP_URL"

# Cross-platform browser open
if command -v open &> /dev/null; then
    open "$APP_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$APP_URL"
else
    echo "   Open manually: $APP_URL"
fi
