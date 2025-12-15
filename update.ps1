# Void Server - Update Script for Windows
# Pull latest code, update dependencies, and restart services.

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

Write-Header "Void Server Update"

# Auto-stash uncommitted changes
$stashed = $false
$gitStatus = git status --porcelain 2>$null

if ($gitStatus) {
    Write-Step "Stashing local changes..."

    $stashResult = git stash push -m "void-update-auto-stash" --include-untracked 2>&1
    if ($LASTEXITCODE -eq 0) {
        $stashed = $true
        Write-Success "Changes stashed"
    } else {
        Write-Warning "Could not stash changes, trying git stash --all..."
        $stashResult = git stash --all 2>&1
        if ($LASTEXITCODE -eq 0) {
            $stashed = $true
            Write-Success "Changes stashed"
        } else {
            Write-Error "Failed to stash changes. Please commit or discard your changes first."
            exit 1
        }
    }
}

# Stop services
Write-Step "Stopping services..."
npx pm2 stop ecosystem.config.js 2>$null
# Ignore errors

# Pull latest code
Write-Step "Pulling latest code..."
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to pull latest code"
    exit 1
}

# Update server dependencies
Write-Step "Updating server dependencies..."
npm install

# Update client dependencies
Write-Step "Updating client dependencies..."
Push-Location client
npm install
Pop-Location

# Update plugin dependencies
Get-ChildItem -Path "plugins" -Directory | ForEach-Object {
    $pluginDir = $_.FullName
    $pluginName = $_.Name
    $pluginPackage = Join-Path $pluginDir "package.json"

    if (Test-Path $pluginPackage) {
        Write-Step "Updating $pluginName dependencies..."
        Push-Location $pluginDir
        npm install
        Pop-Location
    }
}

# Restart services
Write-Step "Restarting services..."
npx pm2 restart ecosystem.config.js

# Show status
Write-Host ""
npx pm2 status

# Restore stashed changes
if ($stashed) {
    Write-Step "Restoring stashed changes..."
    $popResult = git stash pop 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Could not auto-restore stash. Run 'git stash pop' manually."
    }
}

Write-Header "Update Complete!"

Write-Host "Void Server has been updated and restarted." -ForegroundColor Green
Write-Host ""
Write-Host "  API:     http://localhost:4401"
Write-Host "  Client:  http://localhost:4480"
Write-Host ""
