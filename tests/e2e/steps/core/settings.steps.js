const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I select the {string} theme', async function (themeName) {
  // Click on theme selector option
  const themeButton = this.page.locator(`button:has-text("${themeName}"), [data-theme="${themeName.toLowerCase()}"]`).first();
  await themeButton.click();
});

When('I toggle the auto-collapse navigation setting', async function () {
  // Find toggle switch or checkbox near the Auto-collapse text
  const toggle = this.page.locator('[data-testid="auto-collapse-toggle"], input[type="checkbox"]').first();
  await toggle.click();
});

Then('I should see a list of AI providers', async function () {
  // Look for any provider card or the providers section
  await expect(
    this.page.locator('.provider-card, [data-testid="provider"], .card').first()
  ).toBeVisible();
});
