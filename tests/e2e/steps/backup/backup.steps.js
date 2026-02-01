const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Then('the response should contain backup status', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response).toHaveProperty('enabled');
  expect(response).toHaveProperty('backupPath');
});

Then('the response should contain health check results', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response).toHaveProperty('healthy');
});

When('I POST to {string} with backup settings', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      retentionDays: 7,
      schedule: '0 0 * * *'
    }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should indicate backup automation is disabled', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.enabled).toBe(false);
});

Then('the response should indicate backup automation is enabled', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.enabled).toBe(true);
});

Then('the response should contain backup result', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  // May have filename or message depending on Neo4j availability
  expect(response.fileName || response.message).toBeDefined();
});

Then('I store the backup filename', async function () {
  const response = this.testData.lastResponse;
  this.testData.backupFileName = response.fileName;
});

Then('the stored backup should be in the list', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(Array.isArray(response.backups)).toBe(true);

  if (this.testData.backupFileName) {
    const found = response.backups.some(b => b.fileName === this.testData.backupFileName);
    expect(found).toBe(true);
  }
});
