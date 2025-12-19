/**
 * Chrome/Chromium Executable Finder
 *
 * Finds Chrome or Chromium on the host system with platform-specific paths.
 * Falls back to Playwright's bundled Chromium if no system browser found.
 */

const fs = require('fs');
const path = require('path');

// Platform-specific Chrome/Chromium paths
const CHROME_PATHS = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  ],
  win32: [
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ]
};

// Cache the found Chrome path
let cachedChrome = null;

/**
 * Check if a file exists and is executable
 */
function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    // On Windows, just check if file exists
    if (process.platform === 'win32') {
      return fs.existsSync(filePath);
    }
    return false;
  }
}

/**
 * Get Playwright's bundled Chromium executable path
 */
function getPlaywrightChromium() {
  try {
    const playwright = require('playwright');
    const chromiumPath = playwright.chromium.executablePath();
    if (chromiumPath && fs.existsSync(chromiumPath)) {
      return { path: chromiumPath, source: 'playwright' };
    }
  } catch {
    // Playwright not installed or Chromium not downloaded
  }
  return null;
}

/**
 * Find Chrome/Chromium executable on the host system
 * @returns {{ path: string, source: 'chrome'|'chromium'|'playwright' } | null}
 */
function findChrome() {
  // Return cached result if available
  if (cachedChrome) {
    return cachedChrome;
  }

  const platform = process.platform;
  const paths = CHROME_PATHS[platform] || [];

  // Try system Chrome/Chromium first
  for (const chromePath of paths) {
    if (isExecutable(chromePath)) {
      const source = chromePath.toLowerCase().includes('chromium') ? 'chromium' : 'chrome';
      cachedChrome = { path: chromePath, source };
      console.log(`Found ${source} at: ${chromePath}`);
      return cachedChrome;
    }
  }

  // Fall back to Playwright's bundled Chromium
  const playwrightChrome = getPlaywrightChromium();
  if (playwrightChrome) {
    cachedChrome = playwrightChrome;
    console.log(`Using Playwright Chromium at: ${playwrightChrome.path}`);
    return cachedChrome;
  }

  console.log('No Chrome/Chromium found on system');
  return null;
}

/**
 * Clear the cached Chrome path (useful for testing)
 */
function clearCache() {
  cachedChrome = null;
}

/**
 * Get info about the found Chrome
 */
function getChromeInfo() {
  const chrome = findChrome();
  if (!chrome) {
    return {
      found: false,
      message: 'Chrome/Chromium not found. Install Google Chrome or run: npx playwright install chromium'
    };
  }
  return {
    found: true,
    path: chrome.path,
    source: chrome.source,
    message: `Using ${chrome.source} from: ${chrome.path}`
  };
}

module.exports = {
  findChrome,
  getChromeInfo,
  clearCache,
  getPlaywrightChromium
};
