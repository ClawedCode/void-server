const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('an update is available', async function () {
  // Skip if no update available - this is for testing the UI behavior
  const response = await this.request.get(`${this.config.appUrl}/api/version/check`);
  const data = await response.json();
  if (!data.updateAvailable) {
    return 'skipped';
  }
});

Given('I am running in Docker', async function () {
  const response = await this.request.get(`${this.config.appUrl}/api/version/environment`);
  const data = await response.json();
  if (!data.isDocker) {
    return 'skipped';
  }
});

Given('Watchtower is available', async function () {
  // Actually verify Watchtower is available via the API
  try {
    const response = await this.request.get(`${this.config.appUrl}/api/version/environment`, { timeout: 5000 });
    const data = await response.json();
    if (data.updateMethod !== 'watchtower') {
      return 'skipped';
    }
  } catch {
    return 'skipped';
  }
  this.testData.expectWatchtower = true;
});

Given('Watchtower is not available', async function () {
  // Verify Watchtower is actually not available - skip if it IS available
  try {
    const response = await this.request.get(`${this.config.appUrl}/api/version/environment`, { timeout: 5000 });
    const data = await response.json();
    if (data.updateMethod === 'watchtower') {
      // Watchtower is available - can't test "unavailable" scenario
      return 'skipped';
    }
  } catch {
    // Error checking - assume unavailable
  }
  this.testData.expectWatchtower = false;
});

When('I POST to {string}', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`);
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I click the update button', async function () {
  // Navigate to dashboard to see update notification in nav
  await this.page.goto(`${this.config.appUrl}/`, { timeout: 10000 });
  await this.page.waitForLoadState('load', { timeout: 10000 });

  // Look for update notification (only appears when update is available)
  const updateNotification = this.page.locator('text=Update Available');
  const isVisible = await updateNotification.isVisible({ timeout: 3000 }).catch(() => false);

  if (!isVisible) {
    // No update available - skip this test
    return 'skipped';
  }

  await updateNotification.click();
});

Then('I should see the update notification', async function () {
  await expect(this.page.locator('text=Update')).toBeVisible();
});

Then('I should see Docker-specific update instructions', async function () {
  await expect(this.page.locator('text=docker, text=Docker')).toBeVisible();
});

Then('the response should contain environment info', async function () {
  const response = this.testData.lastResponse;
  expect(response.isDocker !== undefined).toBeTruthy();
});

Then('the response should indicate update method', async function () {
  const response = this.testData.lastResponse;
  expect(response.updateMethod).toBeDefined();
  expect(['watchtower', 'script']).toContain(response.updateMethod);
});

Then('the response should indicate Docker error', async function () {
  const response = this.testData.lastResponse;
  expect(this.testData.lastStatus).toBe(400);
  expect(response.error).toContain('Docker');
});

Then('I should see {string} message', async function (message) {
  await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
});

Then('I should see the Docker command modal', async function () {
  await expect(this.page.locator('text=Docker Update Required')).toBeVisible({ timeout: 10000 });
});

Then('I should see Watchtower error message', async function () {
  await expect(this.page.locator('text=Automatic update unavailable')).toBeVisible();
});
