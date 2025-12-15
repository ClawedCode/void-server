const fs = require('fs').promises;
const path = require('path');

/**
 * Browser Management Service
 *
 * Manages persistent browser profiles with authentication states.
 * Each profile stores cookies/sessions for reuse by plugins.
 *
 * Browser profiles are stored in config/browsers/ which is:
 * - Mounted as a volume in Docker (persistent across container restarts)
 * - Accessible from host for native browser authentication
 */

// Use config directory (mounted in Docker) for persistence
const DATA_DIR = path.join(__dirname, '../../config/browsers');
const CONFIG_FILE = path.join(DATA_DIR, 'browsers.json');

// Detect if running in Docker
const isDocker = () => {
  try {
    require('fs').accessSync('/.dockerenv');
    return true;
  } catch {
    return process.env.DOCKER === 'true';
  }
};

// Track active browser instances
const activeBrowsers = new Map();

// Playwright instance (lazy loaded)
let chromium = null;

async function getPlaywright() {
  if (!chromium) {
    try {
      const playwright = require('playwright');
      chromium = playwright.chromium;
    } catch (err) {
      console.log('⚠️ Playwright not installed. Browser management requires: npm install playwright');
      return null;
    }
  }
  return chromium;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { browsers: {} };
  }
}

async function saveConfig(config) {
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * List all browser profiles
 */
async function listBrowsers() {
  const config = await loadConfig();
  const browsers = Object.entries(config.browsers).map(([id, browser]) => ({
    id,
    ...browser,
    running: activeBrowsers.has(id)
  }));

  // Check authentication status for each
  for (const browser of browsers) {
    browser.authenticated = await checkAuthentication(browser.id);
  }

  return browsers;
}

/**
 * Get a single browser profile
 */
async function getBrowser(id) {
  const config = await loadConfig();
  const browser = config.browsers[id];
  if (!browser) return null;

  return {
    id,
    ...browser,
    running: activeBrowsers.has(id),
    authenticated: await checkAuthentication(id)
  };
}

/**
 * Create a new browser profile
 */
async function createBrowser(id, options = {}) {
  const { name, description = '' } = options;

  if (!id || !id.match(/^[a-z0-9-]+$/)) {
    return { success: false, error: 'Invalid ID. Use lowercase letters, numbers, and hyphens only.' };
  }

  const config = await loadConfig();

  if (config.browsers[id]) {
    return { success: false, error: 'Browser profile already exists' };
  }

  const profileDir = path.join(DATA_DIR, id);
  await fs.mkdir(profileDir, { recursive: true });

  config.browsers[id] = {
    name: name || id,
    description,
    createdAt: new Date().toISOString(),
    profileDir
  };

  await saveConfig(config);

  console.log(`🌐 Created browser profile: ${id}`);

  return { success: true, browser: { id, ...config.browsers[id] } };
}

/**
 * Delete a browser profile
 */
async function deleteBrowser(id) {
  // Close if running
  if (activeBrowsers.has(id)) {
    await closeBrowser(id);
  }

  const config = await loadConfig();

  if (!config.browsers[id]) {
    return { success: false, error: 'Browser profile not found' };
  }

  // Delete profile directory
  const profileDir = path.join(DATA_DIR, id);
  await fs.rm(profileDir, { recursive: true, force: true });

  delete config.browsers[id];
  await saveConfig(config);

  console.log(`🗑️ Deleted browser profile: ${id}`);

  return { success: true };
}

/**
 * Check if browser profile has authentication (cookies exist)
 */
async function checkAuthentication(id) {
  const profileDir = path.join(DATA_DIR, id);
  const cookiesPath = path.join(profileDir, 'Default', 'Cookies');
  const localStatePath = path.join(profileDir, 'Local State');

  const cookiesExist = await fs.access(cookiesPath).then(() => true).catch(() => false);
  const localStateExists = await fs.access(localStatePath).then(() => true).catch(() => false);

  return cookiesExist || localStateExists;
}

/**
 * Get browser status
 */
async function getBrowserStatus(id) {
  const config = await loadConfig();
  const browser = config.browsers[id];

  if (!browser) {
    return { success: false, error: 'Browser profile not found' };
  }

  return {
    success: true,
    id,
    name: browser.name,
    running: activeBrowsers.has(id),
    authenticated: await checkAuthentication(id)
  };
}

/**
 * Launch browser for authentication
 */
async function launchBrowser(id, options = {}) {
  const { url = 'about:blank' } = options;

  // Prevent GUI browser launch inside Docker
  if (isDocker()) {
    return {
      success: false,
      error: 'Cannot launch browser GUI inside Docker. Run void-server natively to authenticate browsers, then use Docker for deployment.',
      isDocker: true
    };
  }

  const chromium = await getPlaywright();
  if (!chromium) {
    return { success: false, error: 'Playwright not installed. Run: npm install playwright' };
  }

  if (activeBrowsers.has(id)) {
    return { success: false, error: 'Browser is already running' };
  }

  const config = await loadConfig();
  const browser = config.browsers[id];

  if (!browser) {
    return { success: false, error: 'Browser profile not found' };
  }

  const profileDir = path.join(DATA_DIR, id);
  await fs.mkdir(profileDir, { recursive: true });

  console.log(`🌐 Launching browser: ${id}`);

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  // Navigate to URL
  const page = context.pages()[0] || await context.newPage();
  if (url !== 'about:blank') {
    await page.goto(url);
  }

  // Store reference
  activeBrowsers.set(id, { context, page });

  // Set up close handler
  context.on('close', () => {
    console.log(`🌐 Browser closed: ${id}`);
    activeBrowsers.delete(id);
  });

  return { success: true, message: 'Browser launched' };
}

/**
 * Close a running browser
 */
async function closeBrowser(id) {
  const instance = activeBrowsers.get(id);

  if (!instance) {
    return { success: false, error: 'Browser is not running' };
  }

  console.log(`🌐 Closing browser: ${id}`);

  await instance.context.close();
  activeBrowsers.delete(id);

  return { success: true };
}

/**
 * Get a browser context for plugin use (headless)
 */
async function getBrowserContext(id) {
  const chromium = await getPlaywright();
  if (!chromium) {
    throw new Error('Playwright not installed');
  }

  const profileDir = path.join(DATA_DIR, id);

  // Check if profile exists
  const exists = await fs.access(profileDir).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error(`Browser profile not found: ${id}`);
  }

  // Launch headless context with the profile
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  return context;
}

/**
 * Get profile directory path for a browser
 */
function getProfileDir(id) {
  return path.join(DATA_DIR, id);
}

module.exports = {
  listBrowsers,
  getBrowser,
  createBrowser,
  deleteBrowser,
  getBrowserStatus,
  launchBrowser,
  closeBrowser,
  checkAuthentication,
  getBrowserContext,
  getProfileDir,
  isDocker,
  DATA_DIR
};
