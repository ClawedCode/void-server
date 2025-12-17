const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Then('the health check should return ok', async function () {
  const response = await this.request.get(`${this.config.appUrl}/health`);
  const data = await response.json();
  expect(data.status).toBe('ok');
});

Then('I should see the {string} service indicator', async function (service) {
  // Use a more specific selector to find service cards
  await expect(
    this.page.locator(`.card:has-text("${service}"), [data-testid="${service.toLowerCase()}"]`).first()
  ).toBeVisible();
});

Then(
  'the {string} service should show {string} status',
  async function (service, status) {
    // Find the service card more specifically
    const serviceCard = this.page.locator(`.card:has-text("${service}")`).first();
    await expect(serviceCard).toContainText(status, { ignoreCase: true });
  }
);
