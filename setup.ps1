# Void Server - Setup Script for Windows
# Run this to bootstrap the project. Safe to run multiple times (idempotent).

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

function Write-Skip {
    param([string]$Message)
    Write-Host "○ " -ForegroundColor Cyan -NoNewline
    Write-Host "$Message " -NoNewline
    Write-Host "(already done)" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✔ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "✖ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

# Get script directory and change to it
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Header "Void Server Setup"

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
}

$nodeVersion = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
if ([int]$nodeVersion -lt 18) {
    Write-Warning "Node.js version $nodeVersion detected. Version 18+ recommended."
}

# Check npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm is not installed. Please install npm and try again."
    exit 1
}

# Check git
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Error "git is not installed. Please install git and try again."
    exit 1
}

# Check for Neo4j (optional)
$neo4jInstalled = $false
$neo4j = Get-Command neo4j -ErrorAction SilentlyContinue
$cypherShell = Get-Command cypher-shell -ErrorAction SilentlyContinue

if ($neo4j) {
    $neo4jInstalled = $true
    Write-Success "Neo4j found"
} elseif ($cypherShell) {
    $neo4jInstalled = $true
    Write-Success "Neo4j found (via cypher-shell)"
} elseif (Test-Path "$env:PROGRAMFILES\Neo4j*") {
    $neo4jInstalled = $true
    Write-Success "Neo4j installation detected"
} else {
    Write-Warning "Neo4j not detected. Memory features require Neo4j."
    Write-Host "         Install from: " -NoNewline
    Write-Host "https://neo4j.com/download/" -ForegroundColor Cyan
}

$nodeVer = node -v
$npmVer = npm -v
Write-Success "Prerequisites satisfied (Node $nodeVer, npm $npmVer)"

# Install server dependencies
$serverModulesExists = Test-Path "node_modules"
$packageJsonTime = (Get-Item "package.json").LastWriteTime
$nodeModulesTime = if ($serverModulesExists) { (Get-Item "node_modules").LastWriteTime } else { [DateTime]::MinValue }

if ($serverModulesExists -and $nodeModulesTime -gt $packageJsonTime) {
    Write-Skip "Server dependencies installed"
} else {
    Write-Step "Installing server dependencies..."
    npm install --silent 2>$null
    Write-Success "Server dependencies installed"
}

# Install client dependencies
$clientModulesExists = Test-Path "client/node_modules"
$clientPackageTime = (Get-Item "client/package.json").LastWriteTime
$clientModulesTime = if ($clientModulesExists) { (Get-Item "client/node_modules").LastWriteTime } else { [DateTime]::MinValue }

if ($clientModulesExists -and $clientModulesTime -gt $clientPackageTime) {
    Write-Skip "Client dependencies installed"
} else {
    Write-Step "Installing client dependencies..."
    Push-Location client
    npm install --silent 2>$null
    Pop-Location
    Write-Success "Client dependencies installed"
}

# Install plugin dependencies
$pluginCount = 0
Get-ChildItem -Path "plugins" -Directory | ForEach-Object {
    $pluginDir = $_.FullName
    $pluginName = $_.Name
    $pluginPackage = Join-Path $pluginDir "package.json"

    if (Test-Path $pluginPackage) {
        $pluginModules = Join-Path $pluginDir "node_modules"
        $pluginModulesExists = Test-Path $pluginModules
        $pluginPackageTime = (Get-Item $pluginPackage).LastWriteTime
        $pluginModulesTime = if ($pluginModulesExists) { (Get-Item $pluginModules).LastWriteTime } else { [DateTime]::MinValue }

        if ($pluginModulesExists -and $pluginModulesTime -gt $pluginPackageTime) {
            Write-Skip "Plugin $pluginName dependencies installed"
        } else {
            Write-Step "Installing $pluginName dependencies..."
            Push-Location $pluginDir
            npm install --silent 2>$null
            Pop-Location
            Write-Success "Plugin $pluginName dependencies installed"
        }
        $script:pluginCount++
    }
}

if ($pluginCount -eq 0) {
    Write-Skip "No plugins with dependencies"
}

# Create necessary directories
@("logs", "config", "plugins") | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ | Out-Null
        Write-Step "Created $_/"
    }
}

# Initialize config files
if (-not (Test-Path "config/plugins.json")) {
    Write-Step "Creating default plugin config..."
    "{}" | Out-File -FilePath "config/plugins.json" -Encoding utf8
} else {
    Write-Skip "Plugin config exists"
}

if (-not (Test-Path "config/secrets-allowlist.json")) {
    Write-Step "Creating secrets allowlist..."
    @"
{
  "description": "Allowlist for secret scanning false positives",
  "version": "1.0.0",
  "patterns": [],
  "files": [],
  "hashes": []
}
"@ | Out-File -FilePath "config/secrets-allowlist.json" -Encoding utf8
} else {
    Write-Skip "Secrets allowlist exists"
}

# PM2 setup
Write-Header "Starting Services with PM2"

# Stop any existing instances
Write-Step "Stopping existing instances..."
npx pm2 delete ecosystem.config.js 2>$null
# Ignore errors from pm2 delete

# Start with PM2
Write-Step "Starting void-server (4401) and void-client dev (4480)..."
npx pm2 start ecosystem.config.js --env development

# Save PM2 process list
Write-Step "Saving PM2 process list..."
npx pm2 save

# Show status
Write-Host ""
npx pm2 status

# Summary
Write-Header "Setup Complete!"

Write-Host "Void Server is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  API:     http://localhost:4401"
Write-Host "  Client:  http://localhost:4480 (Vite dev server with HMR)"
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  npm run logs      View logs"
Write-Host "  npm run status    Check status"
Write-Host "  npm run restart   Restart services"
Write-Host "  npm run stop      Stop services"
Write-Host ""
Write-Host "Streaming logs (Ctrl+C to exit)..." -ForegroundColor Cyan
Write-Host ""
npx pm2 logs
