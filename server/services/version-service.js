/**
 * Version Service
 * Checks for updates against GitHub releases
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const REPO_OWNER = 'ClawedCode';
const REPO_NAME = 'void-server';
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

// Cache the latest version check (don't spam GitHub API)
let cachedLatestVersion = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

/**
 * Fetch latest release from GitHub
 */
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'void-server',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(GITHUB_API, options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const release = JSON.parse(data);
          resolve({
            version: release.tag_name.replace(/^v/, ''),
            url: release.html_url,
            name: release.name,
            publishedAt: release.published_at,
            body: release.body
          });
        } else if (res.statusCode === 404) {
          resolve(null); // No releases yet
        } else {
          reject(new Error(`GitHub API returned ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Compare version strings (semver)
 */
function compareVersions(current, latest) {
  const parseSemver = (v) => v.split('.').map(n => parseInt(n, 10) || 0);
  const c = parseSemver(current);
  const l = parseSemver(latest);

  for (let i = 0; i < 3; i++) {
    if (l[i] > c[i]) return 1;  // latest is newer
    if (l[i] < c[i]) return -1; // current is newer
  }
  return 0; // equal
}

/**
 * Check for updates (with caching)
 */
async function checkForUpdate() {
  const now = Date.now();
  const currentVersion = getCurrentVersion();

  // Return cached result if still valid
  if (cachedLatestVersion && (now - lastCheckTime) < CACHE_DURATION) {
    return {
      currentVersion,
      latestVersion: cachedLatestVersion.version,
      updateAvailable: compareVersions(currentVersion, cachedLatestVersion.version) > 0,
      releaseUrl: cachedLatestVersion.url,
      releaseName: cachedLatestVersion.name,
      cached: true
    };
  }

  // Fetch latest from GitHub
  const latest = await fetchLatestRelease();

  if (!latest) {
    return {
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      error: 'No releases found'
    };
  }

  // Update cache
  cachedLatestVersion = latest;
  lastCheckTime = now;

  const updateAvailable = compareVersions(currentVersion, latest.version) > 0;

  return {
    currentVersion,
    latestVersion: latest.version,
    updateAvailable,
    releaseUrl: latest.url,
    releaseName: latest.name,
    publishedAt: latest.publishedAt,
    cached: false
  };
}

/**
 * Check if running in Docker container
 */
function isDocker() {
  // Check for Docker-specific files
  if (fs.existsSync('/.dockerenv')) return true;
  // Check cgroup for docker
  if (fs.existsSync('/proc/1/cgroup')) {
    const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
    if (cgroup.includes('docker') || cgroup.includes('kubepods')) return true;
  }
  return false;
}

/**
 * Run the update script
 */
function runUpdate() {
  return new Promise((resolve, reject) => {
    // Docker containers should be updated externally
    if (isDocker()) {
      reject(new Error('Docker installation detected. Update from host: docker compose down && git pull && docker compose up -d --build'));
      return;
    }

    const projectRoot = path.resolve(__dirname, '../..');
    const isWindows = process.platform === 'win32';

    // Try to find update script
    let updateScript;
    let command;
    let args;

    if (isWindows) {
      updateScript = path.join(projectRoot, 'update.ps1');
      command = 'powershell';
      args = ['-ExecutionPolicy', 'Bypass', '-File', updateScript];
    } else {
      updateScript = path.join(projectRoot, 'update.sh');
      command = 'bash';
      args = [updateScript];
    }

    if (!fs.existsSync(updateScript)) {
      reject(new Error(`Update script not found: ${updateScript}`));
      return;
    }

    console.log(`🔄 Running update script: ${updateScript}`);

    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Update completed successfully');
        resolve({ success: true, output: stdout });
      } else {
        console.log(`❌ Update failed with code ${code}`);
        reject(new Error(`Update failed: ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to run update: ${err.message}`));
    });
  });
}

/**
 * Clear the version cache (useful after update)
 */
function clearCache() {
  cachedLatestVersion = null;
  lastCheckTime = 0;
}

module.exports = {
  getCurrentVersion,
  checkForUpdate,
  runUpdate,
  clearCache,
  compareVersions
};
