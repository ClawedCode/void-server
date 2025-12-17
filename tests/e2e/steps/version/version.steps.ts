import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { VoidWorld } from '../../support/world';

Given('an update is available', async function (this: VoidWorld) {
  // Skip if no update available - this is for testing the UI behavior
  const response = await this.request.get(`${this.config.appUrl}/api/version/check`);
  const data = await response.json();
  if (!data.updateAvailable) {
    this.skip();
  }
});

Given('I am running native installation', async function (this: VoidWorld) {
  const response = await this.request.get(`${this.config.appUrl}/api/version/environment`);
  const data = await response.json();
  if (data.isDocker) {
    this.skip();
  }
});

Given('I am running in Docker', async function (this: VoidWorld) {
  const response = await this.request.get(`${this.config.appUrl}/api/version/environment`);
  const data = await response.json();
  if (!data.isDocker) {
    this.skip();
  }
});

Given('Watchtower is available', async function (this: VoidWorld) {
  // This would need to check if Watchtower is running
  // For now, we'll skip in environments where we can't verify
  this.testData.expectWatchtower = true;
});

Given('Watchtower is not available', async function (this: VoidWorld) {
  // Mock or expect Watchtower to be unavailable
  this.testData.expectWatchtower = false;
});

When('I POST to {string}', async function (this: VoidWorld, endpoint: string) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`);
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I click the update button', async function (this: VoidWorld) {
  // Find and click the update button in the navigation
  const updateButton = this.page.locator('button:has-text("Update"), button:has([class*="ArrowUpCircle"])');
  if (await updateButton.isVisible()) {
    await updateButton.click();
  }
});

Then('I should see the update notification', async function (this: VoidWorld) {
  await expect(this.page.locator('text=Update')).toBeVisible();
});

Then('I should see Docker-specific update instructions', async function (this: VoidWorld) {
  await expect(this.page.locator('text=docker, text=Docker')).toBeVisible();
});

Then('the response should contain environment info', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  expect(response.isDocker !== undefined).toBeTruthy();
});

Then('the response should indicate update method', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  expect(response.updateMethod).toBeDefined();
  expect(['watchtower', 'script']).toContain(response.updateMethod);
});

Then('the response should indicate Docker error', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  expect(this.testData.lastStatus).toBe(400);
  expect(response.error).toContain('Docker');
});

Then('I should see {string} message', async function (this: VoidWorld, message: string) {
  await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
});

Then('I should see the Docker command modal', async function (this: VoidWorld) {
  await expect(this.page.locator('text=Docker Update Required')).toBeVisible({ timeout: 10000 });
});

Then('I should see Watchtower error message', async function (this: VoidWorld) {
  await expect(this.page.locator('text=Automatic update unavailable')).toBeVisible();
});
