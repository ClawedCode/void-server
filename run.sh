#!/bin/bash
# Void Server - Run Script
# Starts infrastructure (Docker) and application (PM2).

set -e

# Colors
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

echo -e "${GREEN}▶${NC} Starting infrastructure containers..."
docker compose up -d

echo -e "${GREEN}▶${NC} Starting void-server with PM2..."
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart ecosystem.config.js

echo ""
pm2 status

echo ""
echo -e "${GREEN}Void Server is running!${NC}"
echo ""
echo "  App:     http://localhost:4420"
echo "  Neo4j:   http://localhost:7474"
echo "  IPFS:    http://localhost:5001"
echo "  Ollama:  http://localhost:11434"
echo ""

open_browser "http://localhost:4420"

echo -e "${CYAN}Streaming logs (Ctrl+C to exit)...${NC}"
echo ""
pm2 logs
