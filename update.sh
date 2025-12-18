#!/bin/bash
# Void Server - Update Script
# Pull latest code, update containers, and restart services.

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

print_success() {
  echo -e "${GREEN}✔${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✖${NC} $1"
}

# Check if Docker is available
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
    print_step "Docker socket GID: $docker_gid (browser sidecar enabled)"
  fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_header "Void Server Update"

# Check Docker is available
if ! check_docker; then
  print_error "Docker is required to run Void Server"
  echo ""
  echo -e "Please install Docker Desktop from:"
  echo -e "  ${CYAN}https://www.docker.com/products/docker-desktop/${NC}"
  exit 1
fi

print_success "Docker is available"

# Auto-stash uncommitted changes
STASHED=false
if [[ -n $(git status --porcelain) ]]; then
  print_step "Stashing local changes..."
  if git stash push -m "void-update-auto-stash" --include-untracked 2>/dev/null; then
    STASHED=true
    print_success "Changes stashed"
  else
    print_warning "Could not stash changes, trying git stash --all..."
    if git stash --all; then
      STASHED=true
      print_success "Changes stashed"
    else
      print_error "Failed to stash changes. Please commit or discard your changes first."
      exit 1
    fi
  fi
fi

# Stop services
print_step "Stopping services..."
docker compose stop 2>/dev/null || true

# Clean up unused Docker resources
print_step "Cleaning up unused Docker resources..."
docker system prune -y

# Pull latest code
print_step "Pulling latest code..."
git pull --rebase

# Configure Docker GID for browser management
configure_docker_gid

# Pull new images and rebuild
print_step "Pulling latest Docker images..."
docker compose pull

print_step "Rebuilding and restarting containers..."
docker compose up -d --build

# Show status
echo ""
docker compose ps

# Restore stashed changes
if [[ "$STASHED" == true ]]; then
  print_step "Restoring stashed changes..."
  git stash pop || print_warning "Could not auto-restore stash. Run 'git stash pop' manually."
fi

print_header "Update Complete!"

echo -e "${GREEN}Void Server has been updated and restarted.${NC}"
echo ""
echo "  App:     http://localhost:4420"
echo "  Neo4j:   http://localhost:4421"
echo ""
