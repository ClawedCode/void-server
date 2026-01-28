/**
 * Memory Sync Service
 *
 * Handles cross-instance memory sharing for federation:
 * - Standardized memory schema for compatibility
 * - Content hashing for deduplication
 * - Selective export by category, stage, or tag
 * - Delta sync support (only new/modified memories)
 * - Import with collision detection
 */

const crypto = require('crypto');
const { getNeo4jService } = require('./neo4j-service');
const { getFederationService } = require('./federation-service');
const memoryService = require('./memory-service');
const walletService = require('./wallet/wallet-service');
const memorySigningService = require('./memory-signing-service');

// Default void-mud relay URL
const DEFAULT_RELAY_URL = 'https://void-mud.onrender.com';

// Sync metadata stored in Neo4j
const SYNC_NODE_LABEL = 'MemorySyncState';

/**
 * Generate content hash for deduplication
 * Uses SHA-256 of normalized content
 */
function generateContentHash(memory) {
  const content = {
    text: (memory.content?.text || memory.content || '').trim().toLowerCase(),
    category: memory.category,
    tags: (memory.tags || []).sort()
  };
  return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/**
 * Normalize memory to federation schema
 * Strips internal fields and adds federation metadata
 */
function normalizeForExport(memory, sourceServerId) {
  return {
    // Core content
    id: memory.id,
    content: {
      text: memory.content?.text || memory.content || '',
      context: memory.content?.context || '',
      impact: memory.content?.impact || '',
      significance: memory.content?.significance || 'normal'
    },
    category: memory.category,
    stage: memory.stage,
    importance: memory.importance,
    tags: memory.tags || [],
    type: memory.type || 'observation',
    timestamp: memory.timestamp,

    // Federation metadata
    federation: {
      sourceServerId,
      contentHash: generateContentHash(memory),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  };
}

/**
 * Prepare memory for import
 * Adds provenance tracking and checks for collisions
 */
function prepareForImport(federatedMemory, importedBy) {
  const localId = `fed_${federatedMemory.federation.sourceServerId.replace('void-', '')}_${federatedMemory.id.replace('mem_', '')}`;

  return {
    id: localId,
    content: federatedMemory.content,
    category: federatedMemory.category,
    stage: federatedMemory.stage,
    importance: federatedMemory.importance,
    tags: [...(federatedMemory.tags || []), 'federated'],
    type: federatedMemory.type,
    timestamp: federatedMemory.timestamp,
    source: 'federation',
    relatedUsers: [],
    metrics: {
      relevance: 0.5,
      interactions: 0,
      views: 0,
      lastAccessed: new Date().toISOString()
    },
    // Provenance tracking
    provenance: {
      sourceServerId: federatedMemory.federation.sourceServerId,
      originalId: federatedMemory.id,
      contentHash: federatedMemory.federation.contentHash,
      importedAt: new Date().toISOString(),
      importedBy
    }
  };
}

class MemorySyncService {
  constructor() {
    this.syncInProgress = false;
  }

  /**
   * Export memories for federation sharing
   * @param {Object} options - Export options
   * @param {string} options.category - Filter by category
   * @param {number} options.stage - Filter by stage
   * @param {string[]} options.tags - Filter by tags (any match)
   * @param {number} options.minImportance - Minimum importance threshold
   * @param {string} options.since - ISO timestamp for delta sync
   * @param {number} options.limit - Max memories to export
   * @param {boolean} options.sign - Sign each memory with wallet (default: true)
   * @param {string} options.signingWallet - Public key of signing wallet (optional)
   */
  async exportMemories(options = {}) {
    const federation = getFederationService();
    const sourceServerId = federation.identity.serverId;

    // Get all memories with filters
    const data = await memoryService.getAllMemories(options.limit || 1000);
    let memories = data.memories || [];

    // Apply filters
    if (options.category) {
      memories = memories.filter(m => m.category === options.category);
    }

    if (options.stage) {
      memories = memories.filter(m => m.stage === options.stage);
    }

    if (options.tags?.length) {
      memories = memories.filter(m =>
        (m.tags || []).some(t => options.tags.includes(t))
      );
    }

    if (options.minImportance !== undefined) {
      memories = memories.filter(m => m.importance >= options.minImportance);
    }

    // Delta sync - only memories modified since timestamp
    if (options.since) {
      const sinceDate = new Date(options.since);
      memories = memories.filter(m =>
        new Date(m.timestamp) > sinceDate ||
        (m.metrics?.lastAccessed && new Date(m.metrics.lastAccessed) > sinceDate)
      );
    }

    // Normalize for export
    let exportedMemories = memories.map(m => normalizeForExport(m, sourceServerId));

    // Sign memories if requested (default: true)
    const shouldSign = options.sign !== false;
    let signingWallet = options.signingWallet;
    let signingErrors = [];

    if (shouldSign) {
      // Get signing wallet if not provided
      if (!signingWallet) {
        const groups = walletService.getWalletGroups();
        if (groups?.length && groups[0].addresses?.length) {
          signingWallet = groups[0].addresses[0].publicKey;
        }
      }

      if (signingWallet) {
        const signResult = memorySigningService.signMemoriesForExport(exportedMemories, signingWallet);
        exportedMemories = signResult.signed;
        signingErrors = signResult.errors;

        if (signResult.errors.length > 0) {
          console.log(`Memory export: ${signResult.errors.length} signing errors`);
        }
      }
    }

    // Create export manifest
    const manifest = {
      version: '1.1', // Updated for signed memories
      sourceServerId,
      sourcePublicKey: federation.identity.publicKey,
      signingWallet: signingWallet || null,
      signed: shouldSign && !!signingWallet,
      exportedAt: new Date().toISOString(),
      filters: options,
      count: exportedMemories.length,
      contentHashes: exportedMemories.map(m => m.federation.contentHash)
    };

    // Sign the manifest
    const signature = federation.sign(manifest);

    return {
      manifest,
      signature,
      memories: exportedMemories,
      signingErrors: signingErrors.length > 0 ? signingErrors : undefined
    };
  }

  /**
   * Import memories from another server
   * @param {Object} exportData - Data from exportMemories
   * @param {Object} options - Import options
   * @param {boolean} options.skipDuplicates - Skip memories with matching content hash
   * @param {boolean} options.dryRun - Don't actually import, just check
   * @param {boolean} options.requireSignatures - Require valid signatures (default: false for backwards compat)
   */
  async importMemories(exportData, options = {}) {
    const federation = getFederationService();
    const { manifest, signature, memories } = exportData;

    // Allow self-import (for testing and local memory backup/restore)
    const isSelfImport = manifest.sourceServerId === federation.identity.serverId;

    if (!isSelfImport) {
      // Verify signature from source server
      const peer = federation.getPeer(manifest.sourceServerId);
      if (!peer) {
        return {
          success: false,
          error: `Unknown source server: ${manifest.sourceServerId}. Add as peer first.`
        };
      }

      const isValid = federation.verify(manifest, signature, peer.publicKey);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid signature - manifest may have been tampered with'
        };
      }
    } else {
      // For self-import, verify our own signature
      const isValid = federation.verify(manifest, signature, federation.identity.publicKey);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid signature on self-import'
        };
      }
    }

    // Check for duplicates
    const existingHashes = await this.getExistingContentHashes();
    const results = {
      imported: 0,
      skipped: 0,
      duplicates: [],
      errors: [],
      signatureErrors: []
    };

    for (const memory of memories) {
      const contentHash = memory.federation.contentHash;

      // Check for duplicate
      if (existingHashes.has(contentHash)) {
        results.skipped++;
        results.duplicates.push({
          id: memory.id,
          contentHash,
          reason: 'Content already exists'
        });
        continue;
      }

      // Verify memory signature if present
      if (memorySigningService.isSigned(memory)) {
        const verification = memorySigningService.verifyMemorySignature(memory);
        if (!verification.valid) {
          results.signatureErrors.push({
            id: memory.id,
            error: verification.error || 'Invalid signature'
          });
          if (options.requireSignatures) {
            continue; // Skip memories with invalid signatures
          }
        }
      } else if (options.requireSignatures) {
        results.signatureErrors.push({
          id: memory.id,
          error: 'Memory not signed'
        });
        continue;
      }

      if (options.dryRun) {
        results.imported++;
        continue;
      }

      // Prepare and import
      const localMemory = prepareForImport(memory, federation.identity.serverId);

      const created = await memoryService.createMemory(localMemory);
      if (created) {
        results.imported++;
        existingHashes.add(contentHash);

        // Store content hash mapping
        await this.storeContentHashMapping(contentHash, localMemory.id, manifest.sourceServerId);
      } else {
        results.errors.push({
          id: memory.id,
          error: 'Failed to create memory'
        });
      }
    }

    // Update sync state
    if (!options.dryRun && results.imported > 0) {
      await this.updateSyncState(manifest.sourceServerId, {
        lastSync: new Date().toISOString(),
        memoriesImported: results.imported,
        lastManifest: manifest
      });
    }

    return {
      success: true,
      dryRun: options.dryRun || false,
      source: manifest.sourceServerId,
      ...results,
      signatureErrors: results.signatureErrors.length > 0 ? results.signatureErrors : undefined
    };
  }

  /**
   * Get content hashes of all local memories for deduplication
   */
  async getExistingContentHashes() {
    const neo4j = getNeo4jService();
    const hashes = new Set();

    if (!await neo4j.isAvailable()) {
      // Fallback: compute from memories
      const data = await memoryService.getAllMemories(0);
      for (const memory of data.memories || []) {
        hashes.add(generateContentHash(memory));
      }
      return hashes;
    }

    // Get stored hashes from Neo4j
    const result = await neo4j.read(`
      MATCH (m:Memory)
      WHERE m.contentHash IS NOT NULL
      RETURN m.contentHash as hash
    `);

    for (const row of result) {
      if (row.hash) hashes.add(row.hash);
    }

    // Also compute for memories without stored hash
    const unhashed = await neo4j.read(`
      MATCH (m:Memory)
      WHERE m.contentHash IS NULL
      RETURN m
    `);

    for (const row of unhashed) {
      if (row.m) {
        const memory = memoryService.formatMemoryFromNeo4j
          ? memoryService.formatMemoryFromNeo4j(row.m)
          : row.m.properties;
        if (memory) {
          hashes.add(generateContentHash(memory));
        }
      }
    }

    return hashes;
  }

  /**
   * Store content hash to local ID mapping for tracking provenance
   */
  async storeContentHashMapping(contentHash, localId, sourceServerId) {
    const neo4j = getNeo4jService();
    if (!await neo4j.isAvailable()) return;

    await neo4j.write(`
      MATCH (m:Memory {id: $localId})
      SET m.contentHash = $contentHash,
          m.federationSource = $sourceServerId
    `, { localId, contentHash, sourceServerId });
  }

  /**
   * Get sync state for a peer
   */
  async getSyncState(peerId) {
    const neo4j = getNeo4jService();
    if (!await neo4j.isAvailable()) return null;

    const result = await neo4j.read(`
      MATCH (s:${SYNC_NODE_LABEL} {peerId: $peerId})
      RETURN s
    `, { peerId });

    return result[0]?.s?.properties || null;
  }

  /**
   * Update sync state for a peer
   */
  async updateSyncState(peerId, state) {
    const neo4j = getNeo4jService();
    if (!await neo4j.isAvailable()) return;

    await neo4j.write(`
      MERGE (s:${SYNC_NODE_LABEL} {peerId: $peerId})
      SET s.lastSync = $lastSync,
          s.memoriesImported = COALESCE(s.memoriesImported, 0) + $memoriesImported,
          s.updatedAt = datetime()
    `, {
      peerId,
      lastSync: state.lastSync,
      memoriesImported: state.memoriesImported
    });
  }

  /**
   * Get all sync states
   */
  async getAllSyncStates() {
    const neo4j = getNeo4jService();
    if (!await neo4j.isAvailable()) return [];

    const result = await neo4j.read(`
      MATCH (s:${SYNC_NODE_LABEL})
      RETURN s
      ORDER BY s.lastSync DESC
    `);

    return result.map(r => r.s?.properties || null).filter(Boolean);
  }

  /**
   * Perform delta sync with a peer
   * Only fetches memories modified since last sync
   */
  async deltaSync(peerId) {
    const federation = getFederationService();
    const peer = federation.getPeer(peerId);

    if (!peer) {
      return { success: false, error: 'Peer not found' };
    }

    // Get last sync timestamp
    const syncState = await this.getSyncState(peerId);
    const since = syncState?.lastSync || null;

    // Request export from peer
    const url = `${peer.endpoint.replace(/\/$/, '')}/api/federation/memories/export`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        since,
        requesterId: federation.identity.serverId
      }),
      signal: AbortSignal.timeout(60000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      return { success: false, error: response.error || 'Failed to fetch from peer' };
    }

    const exportData = await response.json();

    if (!exportData.success) {
      return { success: false, error: exportData.error };
    }

    // Import the memories
    return this.importMemories(exportData.data, { skipDuplicates: true });
  }

  /**
   * Get sync statistics
   */
  async getStats() {
    const neo4j = getNeo4jService();

    const stats = {
      totalFederated: 0,
      bySource: {},
      syncStates: []
    };

    if (!await neo4j.isAvailable()) return stats;

    // Count federated memories
    const countResult = await neo4j.read(`
      MATCH (m:Memory)
      WHERE m.federationSource IS NOT NULL
      RETURN m.federationSource as source, count(m) as count
    `);

    for (const row of countResult) {
      if (row.source) {
        stats.bySource[row.source] = typeof row.count === 'object' ? row.count.toNumber() : row.count;
        stats.totalFederated += stats.bySource[row.source];
      }
    }

    // Get sync states
    stats.syncStates = await this.getAllSyncStates();

    return stats;
  }

  /**
   * Check what would be imported from a peer (dry run)
   */
  async previewImport(peerId, options = {}) {
    const federation = getFederationService();
    const peer = federation.getPeer(peerId);

    if (!peer) {
      return { success: false, error: 'Peer not found' };
    }

    // Request export from peer
    const url = `${peer.endpoint.replace(/\/$/, '')}/api/federation/memories/export`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        requesterId: federation.identity.serverId
      }),
      signal: AbortSignal.timeout(60000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      return { success: false, error: response.error || 'Failed to fetch from peer' };
    }

    const exportData = await response.json();

    if (!exportData.success) {
      return { success: false, error: exportData.error };
    }

    // Dry run import
    return this.importMemories(exportData.data, { dryRun: true });
  }

  // ============================================
  // Bootstrap Methods (for void-mud federation)
  // ============================================

  /**
   * Get auth token for void-mud API calls
   * Signs a message with wallet and exchanges for session token
   */
  async getBootstrapAuthToken() {
    const federation = getFederationService();
    const relayUrl = process.env.RELAY_URL || DEFAULT_RELAY_URL;

    // Get primary wallet
    const groups = walletService.getWalletGroups();
    if (!groups?.length || !groups[0].addresses?.length) {
      return { success: false, error: 'No wallet configured' };
    }

    const primaryWallet = groups[0].addresses[0];
    const publicKey = primaryWallet.publicKey;

    // Create auth message
    const message = JSON.stringify({
      action: 'federation:auth',
      timestamp: Date.now(),
      serverId: federation.identity.serverId
    });

    // Sign the message
    const signResult = walletService.signMessage(publicKey, message);
    if (!signResult.success) {
      return { success: false, error: `Failed to sign: ${signResult.error}` };
    }

    // Exchange for session token via HTTP
    const authUrl = `${relayUrl}/api/federation/auth`;
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey,
        signature: signResult.signature,
        message
      }),
      signal: AbortSignal.timeout(30000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      // Try to parse error response
      const errorText = await response.text?.() || 'Request failed';
      return { success: false, error: errorText };
    }

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      sessionToken: data.sessionToken,
      expiresAt: data.expiresAt
    };
  }

  /**
   * Push bootstrap memories to void-mud
   * Only callable by treasury wallet
   *
   * @param {Object} options - Export options (passed to exportMemories)
   */
  async pushBootstrapMemories(options = {}) {
    const relayUrl = process.env.RELAY_URL || DEFAULT_RELAY_URL;

    // Get auth token
    const authResult = await this.getBootstrapAuthToken();
    if (!authResult.success) {
      return { success: false, error: `Auth failed: ${authResult.error}` };
    }

    // Export memories
    const exportData = await this.exportMemories(options);

    // Push to void-mud
    const pushUrl = `${relayUrl}/api/federation/memories/bootstrap`;
    const response = await fetch(pushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.sessionToken}`
      },
      body: JSON.stringify({
        memories: exportData.memories,
        metadata: {
          manifest: exportData.manifest,
          signature: exportData.signature,
          options
        }
      }),
      signal: AbortSignal.timeout(120000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      const errorText = await response.text?.() || 'Push failed';
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return {
      success: result.success,
      pushedAt: result.pushedAt,
      memoryCount: exportData.memories.length,
      error: result.error
    };
  }

  /**
   * Fetch bootstrap memories from void-mud
   * @param {Object} options - Import options
   * @param {boolean} options.dryRun - Don't actually import, just preview
   */
  async fetchBootstrapMemories(options = {}) {
    const relayUrl = process.env.RELAY_URL || DEFAULT_RELAY_URL;

    // Get auth token
    const authResult = await this.getBootstrapAuthToken();
    if (!authResult.success) {
      return { success: false, error: `Auth failed: ${authResult.error}` };
    }

    // Fetch from void-mud
    const fetchUrl = `${relayUrl}/api/federation/memories/bootstrap`;
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.sessionToken}`
      },
      signal: AbortSignal.timeout(120000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      const errorText = await response.text?.() || 'Fetch failed';
      return { success: false, error: errorText };
    }

    const data = await response.json();

    if (!data.available) {
      return {
        success: true,
        available: false,
        message: data.message || 'No bootstrap memories available'
      };
    }

    // Reconstruct export format for import
    const exportData = {
      manifest: data.metadata?.manifest,
      signature: data.metadata?.signature,
      memories: data.memories
    };

    // Import the memories
    const importResult = await this.importMemories(exportData, {
      skipDuplicates: true,
      dryRun: options.dryRun
    });

    return {
      success: true,
      available: true,
      pushedAt: data.pushedAt,
      ...importResult
    };
  }

  /**
   * Check bootstrap memory availability (no auth required)
   */
  async checkBootstrapStatus() {
    const relayUrl = process.env.RELAY_URL || DEFAULT_RELAY_URL;

    const statusUrl = `${relayUrl}/api/federation/memories/bootstrap/status`;
    const response = await fetch(statusUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    }).catch(err => ({ ok: false, error: err.message }));

    if (!response.ok) {
      return { success: false, error: 'Failed to check bootstrap status' };
    }

    return response.json();
  }
}

// Singleton instance
let instance = null;

function getMemorySyncService() {
  if (!instance) {
    instance = new MemorySyncService();
  }
  return instance;
}

module.exports = {
  MemorySyncService,
  getMemorySyncService,
  generateContentHash,
  normalizeForExport,
  prepareForImport
};
