# Void Server - Setup Script for Windows
# Run this to bootstrap the project. Requires Docker.

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  $Message" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "▶ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "✔ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "✖ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Test-DockerAvailable {
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        return $false
    }
    # Check if Docker daemon is running
    $null = docker info 2>$null
    return $LASTEXITCODE -eq 0
}

function Start-DockerSetup {
    Write-Header "Starting with Docker Compose"

    # On Windows, Docker Desktop handles socket access automatically
    Write-Step "Browser sidecar support enabled (Docker Desktop)"

    Write-Step "Pulling latest images and starting containers..."
    docker compose pull
    docker compose up -d --build

    Write-Host ""
    Write-Success "Void Server is running with Docker!"
    Write-Host ""
    Write-Host "  App:     http://localhost:4420"
    Write-Host "  Neo4j:   http://localhost:4421"
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  docker compose logs -f    View logs"
    Write-Host "  docker compose restart    Restart services"
    Write-Host "  docker compose down       Stop services"
    Write-Host ""
    Write-Host "Streaming logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    Write-Host ""
    docker compose logs -f
}

# Get script directory and change to it
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Header "Void Server Setup"

Write-Step "Detected OS: Windows"

# Check for Docker (required)
Write-Step "Checking for Docker..."

if (Test-DockerAvailable) {
    Write-Success "Docker is installed and running"
    Start-DockerSetup
} else {
    Write-Error "Docker is required to run Void Server"
    Write-Host ""
    Write-Host "Docker Desktop provides everything you need:"
    Write-Host "  - Neo4j database"
    Write-Host "  - IPFS node"
    Write-Host "  - Browser automation with noVNC"
    Write-Host "  - Automatic updates via Watchtower"
    Write-Host ""
    Write-Host "Please install Docker Desktop from:"
    Write-Host "  https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation:"
    Write-Host "  1. Start Docker Desktop"
    Write-Host "  2. Run this script again: .\setup.ps1"
    Write-Host ""
    exit 1
}
