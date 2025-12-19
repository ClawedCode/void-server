# Void Server - Setup Script for Windows
# Requires Docker (for infrastructure) and Node.js (for server).

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
    if (-not $docker) { return $false }
    $null = docker info 2>$null
    return $LASTEXITCODE -eq 0
}

function Test-NodeAvailable {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { return $false }
    $version = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
    return [int]$version -ge 18
}

function Test-PM2Available {
    $pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
    return $null -ne $pm2
}

# Get script directory and change to it
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Header "Void Server Setup"

Write-Step "Detected OS: Windows"

# Check prerequisites
$missing = @()

Write-Step "Checking for Docker..."
if (Test-DockerAvailable) {
    Write-Success "Docker is installed and running"
} else {
    $missing += "docker"
    Write-Error "Docker not found or not running"
}

Write-Step "Checking for Node.js..."
if (Test-NodeAvailable) {
    Write-Success "Node.js $(node -v) installed"
} else {
    $missing += "node"
    Write-Error "Node.js 18+ not found"
}

# Exit if missing prerequisites
if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Error "Missing required dependencies: $($missing -join ', ')"
    Write-Host ""
    Write-Host "Please install:"
    if ($missing -contains "docker") {
        Write-Host "  Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    }
    if ($missing -contains "node") {
        Write-Host "  Node.js 18+:    https://nodejs.org/" -ForegroundColor Cyan
    }
    Write-Host ""
    exit 1
}

Write-Header "Starting Infrastructure (Docker)"

Write-Step "Starting Neo4j, IPFS, and Ollama containers..."
docker compose up -d

# Wait for Neo4j
Write-Step "Waiting for Neo4j to be ready..."
do {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
    $health = docker inspect --format='{{.State.Health.Status}}' void-neo4j 2>$null
} while ($health -ne "healthy")
Write-Host ""
Write-Success "Neo4j is ready"

Write-Header "Setting up Application (Native)"

# Install PM2 if needed
if (-not (Test-PM2Available)) {
    Write-Step "Installing PM2 globally..."
    npm install -g pm2
}

# Install dependencies
Write-Step "Installing server dependencies..."
npm install

Write-Step "Installing client dependencies..."
Push-Location client
npm install
Pop-Location

Write-Step "Building client..."
npm run build --prefix client

# Start with PM2
Write-Step "Starting void-server with PM2..."
pm2 delete void-server void-client 2>$null
pm2 start ecosystem.config.js

Write-Host ""
pm2 status

Write-Header "Setup Complete!"

Write-Host "Void Server is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  App:     http://localhost:4420"
Write-Host "  Neo4j:   http://localhost:7474"
Write-Host "  IPFS:    http://localhost:5001"
Write-Host "  Ollama:  http://localhost:11434"
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  pm2 logs              View server logs"
Write-Host "  pm2 restart all       Restart server"
Write-Host "  pm2 stop all          Stop server"
Write-Host "  .\run.ps1             Start everything"
Write-Host ""

Start-Process "http://localhost:4420"

Write-Host "Streaming logs (Ctrl+C to exit)..." -ForegroundColor Cyan
Write-Host ""
pm2 logs
