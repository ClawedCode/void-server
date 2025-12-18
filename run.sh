#!/bin/bash
# Void Server - Run Script
# Requires Docker.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Open browser (cross-platform)
open_browser() {
  local url="$1"
  if command -v open &>/dev/null; then
    open "$url"
  elif command -v xdg-open &>/dev/null; then
    xdg-open "$url"
  fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Docker is available and running
check_docker() {
  if command -v docker &>/dev/null; then
    if docker info &>/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

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
    echo -e "${GREEN}▶${NC} Docker socket GID: $docker_gid (browser sidecar enabled)"
  fi
}

if ! check_docker; then
  echo -e "${RED}✖${NC} Docker is required to run Void Server"
  echo ""
  echo "Please install Docker Desktop from:"
  echo -e "  ${CYAN}https://www.docker.com/products/docker-desktop/${NC}"
  echo ""
  echo "Then run: ./setup.sh"
  exit 1
fi

# Configure Docker GID for browser management
configure_docker_gid

echo -e "${GREEN}▶${NC} Building latest Docker image..."
docker compose build

echo -e "${GREEN}▶${NC} Starting Void Server with Docker..."
docker compose up -d

echo ""
docker compose ps

echo -e "${CYAN}⏳ Waiting for void-server to be healthy...${NC}"
until docker inspect --format='{{.State.Health.Status}}' void-server 2>/dev/null | grep -q "healthy"; do
  sleep 2
  printf "."
done
echo ""

echo ""
echo -e "${GREEN}Void Server is running with Docker!${NC}"
echo ""
echo "  App:     http://localhost:4420"
echo "  Neo4j:   http://localhost:4421"
echo ""

open_browser "http://localhost:4420"

echo -e "${CYAN}Streaming logs (Ctrl+C to exit)...${NC}"
echo ""
docker compose logs -f
