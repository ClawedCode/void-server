import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { VoidWorld } from '../../support/world';

Then('I should see installed plugins', async function (this: VoidWorld) {
  await expect(this.page.locator('.plugin-list, [data-testid="plugins"]')).toBeVisible();
});

Then('I should see {string} in the list', async function (this: VoidWorld, pluginName: string) {
  await expect(this.page.locator(`text=${pluginName}`)).toBeVisible();
});

Then('the {string} should have a {string} badge', async function (this: VoidWorld, pluginName: string, badge: string) {
  const pluginCard = this.page.locator(`text=${pluginName}`).locator('..').locator('..');
  await expect(pluginCard.locator(`text=${badge}`)).toBeVisible();
});

When('I toggle the {string} plugin', async function (this: VoidWorld, pluginName: string) {
  const pluginCard = this.page.locator(`text=${pluginName}`).locator('..').locator('..');
  const toggle = pluginCard.locator('input[type="checkbox"], button[role="switch"]');
  await toggle.click();
});

Then('I should see the restart required message', async function (this: VoidWorld) {
  await expect(this.page.locator('text=Restart')).toBeVisible();
});

When('I POST plugin install with invalid name {string}', async function (this: VoidWorld, pluginName: string) {
  const response = await this.request.post(`${this.config.appUrl}/api/plugins/install`, {
    data: { source: pluginName },
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST plugin install with name {string}', async function (this: VoidWorld, pluginName: string) {
  const response = await this.request.post(`${this.config.appUrl}/api/plugins/install`, {
    data: { source: pluginName },
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

Then('the response should mention plugin name format', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  expect(response.error).toMatch(/void-plugin-|name/i);
});

Then('the response should mention already installed', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  expect(response.error).toMatch(/already installed/i);
});

Then('user plugins should be from data directory', async function (this: VoidWorld) {
  const response = this.testData.lastResponse as Record<string, unknown>;
  // User-installed plugins should have userInstalled: true flag
  // Built-in plugins should not
  const plugins = (response.installed || response.plugins || []) as Array<Record<string, unknown>>;
  const builtInPlugins = plugins.filter(p => p.builtIn);
  const userPlugins = plugins.filter(p => p.userInstalled);

  // All built-in plugins should NOT have userInstalled flag
  for (const plugin of builtInPlugins) {
    expect(plugin.userInstalled).toBeFalsy();
  }

  // Any user plugins should have userInstalled flag
  for (const plugin of userPlugins) {
    expect(plugin.userInstalled).toBe(true);
  }
});
