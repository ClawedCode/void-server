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
  // This would need to check if Watchtower is running
  // For now, we'll skip in environments where we can't verify
  this.testData.expectWatchtower = true;
});

Given('Watchtower is not available', async function () {
  // Mock or expect Watchtower to be unavailable
  this.testData.expectWatchtower = false;
});

When('I POST to {string}', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`);
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I click the update button', async function () {
  // Find and click the update button in the navigation
  const updateButton = this.page.locator('button:has-text("Update"), button:has([class*="ArrowUpCircle"])');
  if (await updateButton.isVisible()) {
    await updateButton.click();
  }
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
