#!/bin/bash
# Void Server - Setup Script
# Requires Docker (for infrastructure) and Node.js (for server).

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✖${NC} $1"
}

print_success() {
  echo -e "${GREEN}✔${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
  if command -v docker &>/dev/null; then
    if docker info &>/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

# Check if Node.js is installed
check_node() {
  if command -v node &>/dev/null; then
    local version
    version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ "$version" -ge 18 ]]; then
      return 0
    fi
  fi
  return 1
}

# Check if PM2 is installed
check_pm2() {
  command -v pm2 &>/dev/null
}

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

print_header "Void Server Setup"

# Detect OS
case "$(uname -s)" in
  Darwin*) OS="macOS" ;;
  Linux*) OS="Linux" ;;
  *) OS="Unknown" ;;
esac
print_step "Detected OS: $OS"

# Check prerequisites
MISSING=""

print_step "Checking for Docker..."
if check_docker; then
  print_success "Docker is installed and running"
else
  MISSING="docker"
  print_error "Docker not found or not running"
fi

print_step "Checking for Node.js..."
if check_node; then
  print_success "Node.js $(node -v) installed"
else
  if [[ -z "$MISSING" ]]; then
    MISSING="node"
  else
    MISSING="$MISSING node"
  fi
  print_error "Node.js 18+ not found"
fi

# Exit if missing prerequisites
if [[ -n "$MISSING" ]]; then
  echo ""
  print_error "Missing required dependencies: $MISSING"
  echo ""
  echo "Please install:"
  if [[ "$MISSING" == *"docker"* ]]; then
    echo -e "  Docker Desktop: ${CYAN}https://www.docker.com/products/docker-desktop/${NC}"
  fi
  if [[ "$MISSING" == *"node"* ]]; then
    echo -e "  Node.js 18+:    ${CYAN}https://nodejs.org/${NC}"
  fi
  echo ""
  exit 1
fi

print_header "Starting Infrastructure (Docker)"

print_step "Starting Neo4j and IPFS containers..."
docker compose -f docker-compose.infra.yml up -d

# Wait for Neo4j to be healthy
print_step "Waiting for Neo4j to be ready..."
until docker inspect --format='{{.State.Health.Status}}' void-neo4j-dev 2>/dev/null | grep -q "healthy"; do
  sleep 2
  printf "."
done
echo ""
print_success "Neo4j is ready"

print_header "Setting up Application (Native)"

# Install PM2 if needed
if ! check_pm2; then
  print_step "Installing PM2 globally..."
  npm install -g pm2
fi

# Install dependencies
print_step "Installing server dependencies..."
npm install

print_step "Installing client dependencies..."
npm install --prefix client

print_step "Building client..."
npm run build --prefix client

# Start with PM2
print_step "Starting void-server with PM2..."
pm2 delete void-server void-client 2>/dev/null || true
pm2 start ecosystem.config.js

echo ""
pm2 status

print_header "Setup Complete!"

echo -e "${GREEN}Void Server is running!${NC}"
echo ""
echo "  App:     http://localhost:4420"
echo "  Neo4j:   http://localhost:7474"
echo "  IPFS:    http://localhost:5001"
echo ""
echo -e "${CYAN}Commands:${NC}"
echo "  pm2 logs              View server logs"
echo "  pm2 restart all       Restart server"
echo "  pm2 stop all          Stop server"
echo "  ./run.sh              Start everything"
echo ""

open_browser "http://localhost:4420"

echo -e "${CYAN}Streaming logs (Ctrl+C to exit)...${NC}"
echo ""
pm2 logs
