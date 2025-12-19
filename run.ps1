# Void Server - Run Script for Windows
# Starts infrastructure (Docker) and application (PM2).

$ErrorActionPreference = "Stop"

# Get script directory and change to it
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "▶ " -ForegroundColor Green -NoNewline
Write-Host "Starting infrastructure containers..."
docker compose -f docker-compose.infra.yml up -d

Write-Host "▶ " -ForegroundColor Green -NoNewline
Write-Host "Starting void-server with PM2..."
pm2 start ecosystem.config.js 2>$null
if ($LASTEXITCODE -ne 0) {
    pm2 restart ecosystem.config.js
}

Write-Host ""
pm2 status

Write-Host ""
Write-Host "Void Server is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  App:     http://localhost:4420"
Write-Host "  Neo4j:   http://localhost:7474"
Write-Host "  IPFS:    http://localhost:5001"
Write-Host ""

Start-Process "http://localhost:4420"

Write-Host "Streaming logs (Ctrl+C to exit)..." -ForegroundColor Cyan
Write-Host ""
pm2 logs
