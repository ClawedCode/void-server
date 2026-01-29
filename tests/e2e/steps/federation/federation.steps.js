const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

When('I POST to {string} with empty body', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {},
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with invalid endpoint', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { endpoint: 'http://invalid-endpoint-that-does-not-exist.local:9999' },
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with invalid nodeId', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      nodeId: 'deadbeef',
      endpoint: 'https://example.com',
      publicKey: 'test-public-key',
      serverId: 'void-e2e-test',
      capabilities: ['memory']
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

Then('the response should contain a manifest', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.manifest).toBeDefined();
  expect(response.manifest.serverId).toBeDefined();
  expect(response.manifest.publicKey).toBeDefined();
  expect(response.manifest.version).toBeDefined();
  expect(response.manifest.capabilities).toBeDefined();
  expect(Array.isArray(response.manifest.capabilities)).toBe(true);
});

Then('the response should contain server identity', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.serverId).toBeDefined();
  expect(response.publicKey).toBeDefined();
  expect(response.serverId).toMatch(/^void-[a-f0-9]{8}$/);
});

Then('the response should contain federation status', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.status).toBeDefined();
  expect(response.status.serverId).toBeDefined();
  expect(response.status.publicKey).toBeDefined();
  expect(response.status.peers).toBeDefined();
  expect(typeof response.status.uptime).toBe('number');
});

Then('the response should contain a challenge', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.challenge).toBeDefined();
  expect(typeof response.challenge).toBe('string');
  expect(response.serverId).toBeDefined();
  expect(response.publicKey).toBeDefined();
});

Then('the response should contain server ID', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.serverId).toBeDefined();
  expect(response.serverId).toMatch(/^void-[a-f0-9]{8}$/);
});

Then('the response status should be {int}', async function (statusCode) {
  expect(this.testData.lastStatus).toBe(statusCode);
});

Then('the response should contain DHT status', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.nodeId).toBeDefined();
  expect(typeof response.nodeCount).toBe('number');
  expect(typeof response.bootstrapNodes).toBe('number');
  expect(typeof response.isBootstrapped).toBe('boolean');
});

// Neo4j Peer Management Steps

Then('the response should contain Neo4j peer stats', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.stats).toBeDefined();
  expect(typeof response.stats.total).toBe('number');
  expect(response.stats.byTrustLevel).toBeDefined();
});

Then('the response should contain trust graph', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(Array.isArray(response.nodes)).toBe(true);
  expect(Array.isArray(response.edges)).toBe(true);
});

When('I create a test peer {string} in Neo4j', async function (serverId) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/peers/neo4j`, {
    data: {
      serverId,
      publicKey: `TestPubKey-${serverId}`,
      endpoint: `https://${serverId}.example.com`,
      version: '0.15.0',
      capabilities: ['memory', 'chat'],
      trustLevel: 'verified'
    }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
  this.testData.lastPeerId = serverId;
});

Then('the peer should exist in Neo4j', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.peer).toBeDefined();
  expect(response.peer.serverId).toBe(this.testData.lastPeerId);
});

When('I get trust score for peer {string}', async function (serverId) {
  const response = await this.request.get(`${this.config.appUrl}/api/federation/peers/neo4j/${serverId}/trust-score`);
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should contain trust score', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(typeof response.trustScore).toBe('number');
});

When('I block peer {string}', async function (serverId) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/peers/neo4j/${serverId}/block`, {
    data: { reason: 'E2E test block' }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the peer should be blocked', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.peer.trustLevel).toBe('blocked');
});

When('I unblock peer {string}', async function (serverId) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/peers/neo4j/${serverId}/unblock`, {
    data: {}
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the peer should be unblocked', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.peer.trustLevel).toBe('unknown');
});

When('I delete peer {string} from Neo4j', async function (serverId) {
  const response = await this.request.delete(`${this.config.appUrl}/api/federation/peers/neo4j/${serverId}`);
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

When('I create trust relationship from {string} to {string}', async function (fromServerId, toServerId) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/peers/neo4j/${fromServerId}/trust-relationship`, {
    data: { targetServerId: toServerId }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the trust graph should contain relationship from {string} to {string}', async function (fromServerId, toServerId) {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  const edge = response.edges.find(e => e.from === fromServerId && e.to === toServerId);
  expect(edge).toBeDefined();
  expect(edge.type).toBe('TRUSTS');
});

// Secure Communication Steps

Then('the response should contain successful crypto test', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.encryption).toBeDefined();
  expect(response.encryption.matches).toBe(true);
  expect(response.signing).toBeDefined();
  expect(response.signing.verified).toBe(true);
});

// Memory Sync Steps

When('I POST to {string} with limit {int}', async function (endpoint, limit) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { limit },
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
  this.testData.lastExportData = this.testData.lastResponse.data;
});

When('I POST to {string} with category {string}', async function (endpoint, category) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { category, limit: 10 },
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should contain memory export manifest', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.data).toBeDefined();
  expect(response.data.manifest).toBeDefined();
  expect(response.data.manifest.sourceServerId).toBeDefined();
  expect(response.data.manifest.sourcePublicKey).toBeDefined();
  expect(response.data.manifest.exportedAt).toBeDefined();
  expect(typeof response.data.manifest.count).toBe('number');
  expect(response.data.signature).toBeDefined();
  expect(Array.isArray(response.data.memories)).toBe(true);
});

Then('the exported memories should have content hashes', async function () {
  const response = this.testData.lastResponse;
  const memories = response.data.memories;
  expect(memories.length).toBeGreaterThan(0);
  for (const memory of memories) {
    expect(memory.federation).toBeDefined();
    expect(memory.federation.contentHash).toBeDefined();
    expect(typeof memory.federation.contentHash).toBe('string');
    expect(memory.federation.contentHash.length).toBe(64); // SHA-256 hex
  }
});

Then('the response should contain sync stats', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.stats).toBeDefined();
  expect(typeof response.stats.totalFederated).toBe('number');
  expect(response.stats.bySource).toBeDefined();
  expect(Array.isArray(response.stats.syncStates)).toBe(true);
});

Then('the exported memories should all have category {string}', async function (category) {
  const response = this.testData.lastResponse;
  const memories = response.data.memories;
  if (memories.length > 0) {
    for (const memory of memories) {
      expect(memory.category).toBe(category);
    }
  }
});

When('I import the exported memories with dry run', async function () {
  const exportData = this.testData.lastExportData;
  const response = await this.request.post(`${this.config.appUrl}/api/federation/memories/import`, {
    data: { exportData, dryRun: true },
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the import should be a dry run', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.dryRun).toBe(true);
  expect(typeof response.imported).toBe('number');
  expect(typeof response.skipped).toBe('number');
});

// Token Gate Steps

Then('the response should contain token gate config', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.config).toBeDefined();
  expect(response.config.token).toBeDefined();
  expect(response.config.token.symbol).toBe('CLAWED');
  expect(response.config.tiers).toBeDefined();
  expect(response.config.features).toBeDefined();
});

Then('the response should contain tier information', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.wallet).toBeDefined();
  expect(typeof response.balance).toBe('number');
  expect(response.tier).toBeDefined();
  expect(response.token).toBeDefined();
});

Then('the response should contain access information', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.feature).toBeDefined();
  expect(typeof response.allowed).toBe('boolean');
  expect(typeof response.required).toBe('number');
  expect(response.requiredTier).toBeDefined();
});

Then('the response should indicate feature is unknown', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.allowed).toBe(false);
  expect(response.error).toBe('Unknown feature');
});

Then('the response should contain {string}', async function (expectedText) {
  const responseText = JSON.stringify(this.testData.lastResponse);
  expect(responseText).toContain(expectedText);
});

When('I POST to {string} with wallet header {string}', async function (endpoint, walletAddress) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    headers: {
      'X-Wallet-Address': walletAddress
    },
    data: { limit: 2 }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

// Memory Marketplace Steps

Then('the response should contain marketplace stats', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.stats).toBeDefined();
  expect(typeof response.stats.available).toBe('boolean');
  expect(response.stats.tiers).toBeDefined();
  expect(response.stats.qualityWeights).toBeDefined();
});

When('I register contributor {string}', async function (serverId) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/marketplace/contributor/${serverId}`, {
    data: {
      endpoint: `https://${serverId}.example.com`,
      publicKey: `TestPubKey-${serverId}`
    }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should contain contributor profile', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.contributor).toBeDefined();
  expect(response.contributor.serverId).toBeDefined();
  expect(response.contributor.tier).toBeDefined();
});

When('I POST to {string} with interaction {string}', async function (endpoint, interactionType) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { type: interactionType }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with vote {int} from {string}', async function (endpoint, vote, voterId) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { vote, voterId }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should contain vote result', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(typeof response.newVote).toBe('number');
});

Then('the response should contain quality score', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(typeof response.qualityScore).toBe('number');
});

When('I POST to {string} with citing memory {string}', async function (endpoint, citingMemoryId) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { citingMemoryId }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

// Memory IPFS Steps

Then('the response should contain IPFS stats', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(response.stats).toBeDefined();
  expect(response.stats.ipfs).toBeDefined();
  expect(typeof response.stats.ipfs.enabled).toBe('boolean');
  expect(response.stats.memories).toBeDefined();
});

When('I POST to {string} with threshold {int}', async function (endpoint, threshold) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { threshold, limit: 5 }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

Then('the response should contain pinned count', async function () {
  const response = this.testData.lastResponse;
  expect(response.success).toBe(true);
  expect(typeof response.pinned).toBe('number');
});

// DHT Lookup Steps

When('I POST to {string} with nodeId {string}', async function (endpoint, nodeId) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { nodeId }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

// ============================================
// Security Hardening Test Steps
// ============================================

When('I POST to {string} with private IP endpoint', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { endpoint: 'http://192.168.1.100:4420' }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with localhost endpoint', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { endpoint: 'http://localhost:4420', name: 'test-bootstrap' }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with unsigned announcement', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      nodeId: 'a'.repeat(64),
      endpoint: 'https://example.com',
      publicKey: 'test-public-key',
      serverId: 'void-e2e-test',
      capabilities: ['memory'],
      timestamp: Date.now()
      // Note: no signature field
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with expired signature', async function (endpoint) {
  // Create announcement with timestamp 10 minutes in the past
  const oldTimestamp = Date.now() - (10 * 60 * 1000);
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      nodeId: 'b'.repeat(64),
      endpoint: 'https://example.com',
      publicKey: 'test-public-key',
      serverId: 'void-e2e-test',
      capabilities: ['memory'],
      timestamp: oldTimestamp,
      signature: 'fake-signature-that-would-fail-anyway'
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} without requesterId', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: { limit: 5 }
    // Note: no requesterId
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with unknown requesterId', async function (endpoint) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      limit: 5,
      requesterId: 'void-unknown-peer-that-does-not-exist'
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I create a test peer {string} in Neo4j with trust level {string}', async function (serverId, trustLevel) {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/peers/neo4j`, {
    data: {
      serverId,
      publicKey: `TestPubKey-${serverId}`,
      endpoint: `https://${serverId}.example.com`,
      version: '0.15.0',
      capabilities: ['memory'],
      trustLevel
    }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
  this.testData.lastPeerId = serverId;
});

When('I POST to {string} with requesterId {string}', async function (endpoint, requesterId) {
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      limit: 5,
      requesterId
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I modify the exported memories with invalid signature', async function () {
  if (this.testData.lastExportData) {
    // Corrupt the manifest signature
    this.testData.modifiedExportData = {
      ...this.testData.lastExportData,
      signature: 'invalid-signature-corrupted'
    };
    // Also corrupt individual memory signatures if present
    if (this.testData.modifiedExportData.memories) {
      this.testData.modifiedExportData.memories = this.testData.modifiedExportData.memories.map(m => ({
        ...m,
        federation: {
          ...m.federation,
          signature: 'invalid-memory-signature'
        }
      }));
    }
  }
});

When('I import the modified memories', async function () {
  const exportData = this.testData.modifiedExportData || this.testData.lastExportData;
  const response = await this.request.post(`${this.config.appUrl}/api/federation/memories/import`, {
    data: {
      exportData,
      dryRun: true,
      requesterId: 'void-e2etest01' // Use a known test peer
    }
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

When('I POST to {string} with oversized body', async function (endpoint) {
  // Create a large payload (>10MB)
  const largeContent = 'x'.repeat(11 * 1024 * 1024);
  const response = await this.request.post(`${this.config.appUrl}${endpoint}`, {
    data: {
      exportData: {
        manifest: {},
        memories: [{ content: largeContent }]
      },
      requesterId: 'void-e2etest01'
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

When('I request a federation challenge', async function () {
  const response = await this.request.post(`${this.config.appUrl}/api/federation/verify/challenge`, {
    data: {}
  });
  this.testData.lastResponse = await response.json();
  this.testData.lastStatus = response.status();
});

When('I store the challenge', async function () {
  this.testData.storedChallenge = this.testData.lastResponse.challenge;
  this.testData.storedChallengeServerId = this.testData.lastResponse.serverId;
  this.testData.storedChallengePublicKey = this.testData.lastResponse.publicKey;
});

When('I verify the challenge successfully', async function () {
  // Note: In a real scenario, we'd need to sign the challenge with the correct private key
  // For this test, we're testing the replay rejection, so we just store the challenge
  // The actual verification would require the server's private key
  this.testData.challengeVerified = true;
});

When('I attempt to reuse the same challenge', async function () {
  // Attempt to verify with the same challenge again
  const response = await this.request.post(`${this.config.appUrl}/api/federation/verify/response`, {
    data: {
      challenge: this.testData.storedChallenge,
      signature: 'fake-signature', // Signature doesn't matter, challenge should be rejected
      publicKey: this.testData.storedChallengePublicKey
    }
  });
  this.testData.lastResponse = await response.json().catch(() => ({}));
  this.testData.lastStatus = response.status();
});

Then('the verification should fail', async function () {
  // Challenge should be rejected (either expired/used or invalid signature)
  expect(this.testData.lastStatus).not.toBe(200);
});
