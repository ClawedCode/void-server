const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Then('I should see the chat interface', async function () {
  await expect(
    this.page.locator('[data-testid="chat"], .chat-container, main')
  ).toBeVisible();
});

Then('I should see the chat sidebar', async function () {
  await expect(
    this.page.locator('[data-testid="chat-sidebar"], .sidebar, nav')
  ).toBeVisible();
});

Given('at least one AI provider is enabled', async function () {
  const response = await this.request.get(`${this.config.appUrl}/api/ai-providers`);
  const data = await response.json();
  if (!data.activeProvider) {
    return 'skipped';
  }
});

Given('I have an active chat', async function () {
  const response = await this.request.post(`${this.config.appUrl}/api/chat`, {
    data: { templateId: 'clawedegregore' },
  });
  const data = await response.json();
  const chat = data.chat || data;
  this.testData.chatId = chat.id;
  await this.page.goto(`${this.config.appUrl}/chat/${chat.id}`, { timeout: 10000 });
  await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  // Wait for chat interface to be ready
  await this.page.locator('[data-testid="message-input"], textarea').waitFor({ state: 'visible', timeout: 10000 });
});

When('a new chat should be created', async function () {
  await this.page.waitForURL(/\/chat\/[a-z0-9-]+/);
});

When('I type {string} in the message input', async function (message) {
  const input = this.page.locator('[data-testid="message-input"], textarea');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(message);
});

When('I send the message', async function () {
  await this.page.click('[data-testid="send-button"], button:has-text("Send")');
});

Then('my message should appear in the chat', async function () {
  await expect(this.page.locator('.user-message, [data-role="user"]')).toBeVisible();
});

Then('I should receive an AI response', async function () {
  // LM Studio responses can be slow depending on model and hardware
  await expect(
    this.page.locator('[data-role="assistant"]')
  ).toBeVisible({ timeout: 60000 });
});

// Branching step definitions

Given('I have a chat with messages', async function () {
  // Create a new chat
  const createResponse = await this.request.post(`${this.config.appUrl}/api/chat`, {
    data: { templateId: 'clawedegregore' },
  });
  const createData = await createResponse.json();
  const chat = createData.chat || createData;
  this.testData.chatId = chat.id;

  // Add a message via the API (endpoint is /message singular)
  const msgResponse = await this.request.post(`${this.config.appUrl}/api/chat/${chat.id}/message`, {
    data: { content: 'Test message for branching', role: 'user' },
  });
  const msgData = await msgResponse.json();
  this.testData.firstMessageId = msgData.message?.id || msgData.messageId;
});

When('I GET the chat branches', async function () {
  const response = await this.request.get(`${this.config.appUrl}/api/chat/${this.testData.chatId}/branches`);
  this.testData.response = await response.json();
});

Then('the response should contain at least one branch', async function () {
  expect(this.testData.response.success).toBe(true);
  expect(this.testData.response.branches.length).toBeGreaterThanOrEqual(1);
});

When('I create a branch from the first message', async function () {
  const response = await this.request.post(`${this.config.appUrl}/api/chat/${this.testData.chatId}/branch`, {
    data: { messageId: this.testData.firstMessageId, name: 'Test Branch' },
  });
  this.testData.response = await response.json();
  this.testData.newBranchId = this.testData.response.branch?.id;
});

Then('the response should contain the new branch', async function () {
  expect(this.testData.response.success).toBe(true);
  expect(this.testData.response.branch).toBeDefined();
  expect(this.testData.response.branch.name).toBe('Test Branch');
});

Then('the chat should have {int} branches', async function (count) {
  const response = await this.request.get(`${this.config.appUrl}/api/chat/${this.testData.chatId}/branches`);
  const data = await response.json();
  expect(data.branches.length).toBe(count);
});

When('I GET the chat tree structure', async function () {
  const response = await this.request.get(`${this.config.appUrl}/api/chat/${this.testData.chatId}/tree`);
  this.testData.response = await response.json();
});

Then('the response should contain tree nodes', async function () {
  expect(this.testData.response.success).toBe(true);
  expect(this.testData.response.tree).toBeDefined();
  expect(Array.isArray(this.testData.response.tree)).toBe(true);
});

Then('each node should have an id and role', async function () {
  const tree = this.testData.response.tree;
  const checkNode = (node) => {
    expect(node.id).toBeDefined();
    expect(node.role).toBeDefined();
    if (node.children) {
      node.children.forEach(checkNode);
    }
  };
  tree.forEach(checkNode);
});

Given('I have a chat with multiple branches', async function () {
  // Create chat and add messages
  const createResponse = await this.request.post(`${this.config.appUrl}/api/chat`, {
    data: { templateId: 'clawedegregore' },
  });
  const createData = await createResponse.json();
  const chat = createData.chat || createData;
  this.testData.chatId = chat.id;

  // Add a message (endpoint is /message singular)
  const msgResponse = await this.request.post(`${this.config.appUrl}/api/chat/${chat.id}/message`, {
    data: { content: 'Test message', role: 'user' },
  });
  const msgData = await msgResponse.json();
  this.testData.firstMessageId = msgData.message?.id || msgData.messageId;

  // Create a branch
  const branchResponse = await this.request.post(`${this.config.appUrl}/api/chat/${chat.id}/branch`, {
    data: { messageId: this.testData.firstMessageId, name: 'Test Branch' },
  });
  const branchData = await branchResponse.json();
  this.testData.secondBranchId = branchData.branch?.id;
});

When('I switch to a different branch', async function () {
  const response = await this.request.put(`${this.config.appUrl}/api/chat/${this.testData.chatId}/branch/${this.testData.secondBranchId}`, {
    data: { setActive: true },
  });
  this.testData.response = await response.json();
});

Then('the active branch should change', async function () {
  expect(this.testData.response.success).toBe(true);
  expect(this.testData.response.chat.activeBranchId).toBe(this.testData.secondBranchId);
});

Then('I should get messages for that branch', async function () {
  const response = await this.request.get(`${this.config.appUrl}/api/chat/${this.testData.chatId}/branch/${this.testData.secondBranchId}/messages`);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(Array.isArray(data.messages)).toBe(true);
});

When('I navigate to the tree view page', async function () {
  await this.page.goto(`${this.config.appUrl}/chat/${this.testData.chatId}/tree`, { timeout: 10000 });
  await this.page.waitForLoadState('networkidle', { timeout: 10000 });
});

Then('I should see the tree visualization', async function () {
  await expect(this.page.locator('svg')).toBeVisible({ timeout: 5000 });
});

Then('I should see zoom controls', async function () {
  await expect(this.page.locator('button[title="Zoom in"]')).toBeVisible();
  await expect(this.page.locator('button[title="Zoom out"]')).toBeVisible();
});

Given('I am viewing that chat', async function () {
  await this.page.goto(`${this.config.appUrl}/chat/${this.testData.chatId}`, { timeout: 10000 });
  await this.page.waitForLoadState('networkidle', { timeout: 10000 });
});

Then('I should see the branch indicator badge', async function () {
  await expect(this.page.locator('button:has-text("Branch"), button:has-text("Main")')).toBeVisible({ timeout: 5000 });
});

Then('it should show the branch count', async function () {
  await expect(this.page.locator('text=(2)')).toBeVisible({ timeout: 5000 });
});
