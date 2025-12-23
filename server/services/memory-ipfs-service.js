/**
 * Memory IPFS Service
 *
 * Handles IPFS-based memory distribution for federation:
 * - Pin high-value memories to IPFS for persistence
 * - CID-based memory addressing for immutability
 * - Retrieve memories from IPFS by CID
 * - Batch pinning for memory collections
 */

const ipfsService = require('./ipfs-service');
const { getNeo4jService } = require('./neo4j-service');
const { getMemoryMarketplaceService } = require('./memory-marketplace-service');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Quality threshold for auto-pinning
const AUTO_PIN_QUALITY_THRESHOLD = 10.0;

// Data directory for temporary files
const TEMP_DIR = path.resolve(__dirname, '../../data/ipfs/temp');

/**
 * Initialize the memory IPFS service
 */
async function initialize() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await ipfsService.initialize();
}

/**
 * Serialize memory to canonical JSON for IPFS storage
 * @param {Object} memory - Memory object to serialize
 * @returns {Object} Serialized memory with metadata
 */
function serializeMemory(memory) {
  const content = {
    version: '1.0',
    type: 'void-memory',
    memory: {
      id: memory.id,
      content: memory.content,
      category: memory.category,
      stage: memory.stage,
      tags: memory.tags || [],
      importance: memory.importance,
      timestamp: memory.timestamp,
      context: memory.context,
      account: memory.account
    },
    metadata: {
      pinnedAt: new Date().toISOString(),
      contentHash: crypto.createHash('sha256')
        .update(JSON.stringify(memory.content))
        .digest('hex')
    }
  };

  return content;
}

/**
 * Pin a single memory to IPFS
 * @param {Object} memory - Memory object to pin
 * @param {Object} options - Pinning options
 * @returns {Promise<Object>} Pin result with CID
 */
async function pinMemory(memory, options = {}) {
  await initialize();

  const serialized = serializeMemory(memory);
  const jsonContent = JSON.stringify(serialized, null, 2);

  // Write to temp file
  const tempFile = path.join(TEMP_DIR, `memory-${memory.id}.json`);
  await fs.writeFile(tempFile, jsonContent);

  // Pin to IPFS
  const pin = await ipfsService.pinFile(tempFile, {
    name: `memory-${memory.id}`,
    type: 'memory',
    source: 'void-memory'
  });

  // Clean up temp file
  await fs.unlink(tempFile).catch(() => {});

  // Store CID in Neo4j for the memory
  const neo4j = getNeo4jService();
  if (await neo4j.isAvailable()) {
    await neo4j.write(`
      MATCH (m:Memory {id: $memoryId})
      SET m.ipfsCid = $cid,
          m.ipfsPinnedAt = datetime(),
          m.ipfsGatewayUrl = $gatewayUrl
    `, {
      memoryId: memory.id,
      cid: pin.cid,
      gatewayUrl: pin.gatewayUrl
    });
  }

  console.log(`📌 Memory pinned to IPFS: ${pin.cid} (${memory.id})`);

  return {
    success: true,
    memoryId: memory.id,
    cid: pin.cid,
    gatewayUrl: pin.gatewayUrl,
    size: pin.size,
    contentHash: serialized.metadata.contentHash
  };
}

/**
 * Pin multiple memories as a collection
 * @param {Array} memories - Array of memory objects
 * @param {Object} metadata - Collection metadata
 * @returns {Promise<Object>} Collection pin result
 */
async function pinMemoryCollection(memories, metadata = {}) {
  await initialize();

  const collectionDir = path.join(TEMP_DIR, `collection-${Date.now()}`);
  await fs.mkdir(collectionDir, { recursive: true });

  // Write manifest
  const manifest = {
    version: '1.0',
    type: 'void-memory-collection',
    name: metadata.name || 'memory-collection',
    description: metadata.description || '',
    count: memories.length,
    createdAt: new Date().toISOString(),
    memoryIds: memories.map(m => m.id)
  };
  await fs.writeFile(
    path.join(collectionDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Write each memory
  for (const memory of memories) {
    const serialized = serializeMemory(memory);
    await fs.writeFile(
      path.join(collectionDir, `${memory.id}.json`),
      JSON.stringify(serialized, null, 2)
    );
  }

  // Pin the directory
  const pin = await ipfsService.pinDirectory(collectionDir, {
    name: metadata.name || 'memory-collection',
    type: 'memory-collection'
  });

  // Clean up temp directory
  await fs.rm(collectionDir, { recursive: true }).catch(() => {});

  console.log(`📌 Memory collection pinned: ${pin.cid} (${memories.length} memories)`);

  return {
    success: true,
    cid: pin.cid,
    gatewayUrl: pin.gatewayUrl,
    count: memories.length,
    manifest
  };
}

/**
 * Retrieve a memory from IPFS by CID
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} Retrieved memory
 */
async function getMemoryByCid(cid) {
  const config = await ipfsService.loadConfig();

  // Fetch from local IPFS gateway
  const http = require('http');
  const https = require('https');

  return new Promise((resolve, reject) => {
    const gatewayUrl = `${config.gateway}/${cid}`;
    const url = new URL(gatewayUrl);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(gatewayUrl, { timeout: 30000 }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch from IPFS: ${res.statusCode}`));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.type !== 'void-memory') {
          return reject(new Error('Invalid memory format'));
        }
        resolve({
          success: true,
          memory: parsed.memory,
          metadata: parsed.metadata,
          cid
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('IPFS gateway timeout'));
    });
  });
}

/**
 * Pin high-quality memories automatically
 * @param {Object} options - Auto-pin options
 * @returns {Promise<Object>} Auto-pin results
 */
async function autoPinHighQualityMemories(options = {}) {
  const { threshold = AUTO_PIN_QUALITY_THRESHOLD, limit = 50 } = options;

  const neo4j = getNeo4jService();
  if (!await neo4j.isAvailable()) {
    return { success: false, error: 'Neo4j unavailable' };
  }

  // Find high-quality memories not yet pinned
  const neo4jInt = require('neo4j-driver').int;
  const result = await neo4j.read(`
    MATCH (m:Memory)
    WHERE COALESCE(m.qualityScore, 0) >= $threshold
      AND m.ipfsCid IS NULL
    RETURN m
    ORDER BY m.qualityScore DESC
    LIMIT $limit
  `, { threshold, limit: neo4jInt(limit) });

  const memories = result.map(r => r.m?.properties).filter(Boolean);

  if (memories.length === 0) {
    return { success: true, pinned: 0, message: 'No memories to auto-pin' };
  }

  const pinResults = [];
  for (const memory of memories) {
    const pinResult = await pinMemory(memory);
    pinResults.push(pinResult);
  }

  console.log(`📌 Auto-pinned ${pinResults.length} high-quality memories`);

  return {
    success: true,
    pinned: pinResults.length,
    results: pinResults
  };
}

/**
 * Unpin a memory from IPFS
 * @param {string} memoryId - Memory ID
 * @returns {Promise<Object>} Unpin result
 */
async function unpinMemory(memoryId) {
  const neo4j = getNeo4jService();
  if (!await neo4j.isAvailable()) {
    return { success: false, error: 'Neo4j unavailable' };
  }

  // Get CID from Neo4j
  const result = await neo4j.read(`
    MATCH (m:Memory {id: $memoryId})
    RETURN m.ipfsCid as cid
  `, { memoryId });

  const cid = result[0]?.cid;
  if (!cid) {
    return { success: false, error: 'Memory not pinned to IPFS' };
  }

  // Unpin from IPFS
  await ipfsService.unpin(cid);

  // Update Neo4j
  await neo4j.write(`
    MATCH (m:Memory {id: $memoryId})
    REMOVE m.ipfsCid, m.ipfsPinnedAt, m.ipfsGatewayUrl
  `, { memoryId });

  return { success: true, memoryId, cid };
}

/**
 * Get IPFS status for memories
 * @returns {Promise<Object>} Memory IPFS statistics
 */
async function getMemoryIpfsStats() {
  const neo4j = getNeo4jService();
  const ipfsStatus = await ipfsService.getStatus();

  let memoryStats = {
    pinnedCount: 0,
    byCategory: {},
    totalSize: 0
  };

  if (await neo4j.isAvailable()) {
    const result = await neo4j.read(`
      MATCH (m:Memory)
      WHERE m.ipfsCid IS NOT NULL
      RETURN
        count(m) as pinnedCount,
        collect(DISTINCT m.category) as categories
    `);

    if (result[0]) {
      memoryStats.pinnedCount = result[0].pinnedCount || 0;
    }

    // Get counts by category
    const categoryResult = await neo4j.read(`
      MATCH (m:Memory)
      WHERE m.ipfsCid IS NOT NULL
      RETURN m.category as category, count(m) as count
    `);

    for (const row of categoryResult) {
      if (row.category) {
        memoryStats.byCategory[row.category] = row.count;
      }
    }
  }

  return {
    ipfs: {
      enabled: ipfsStatus.enabled,
      daemonOnline: ipfsStatus.daemonOnline,
      gateway: ipfsStatus.gateway,
      nat: ipfsStatus.nat
    },
    memories: memoryStats,
    autoPinThreshold: AUTO_PIN_QUALITY_THRESHOLD
  };
}

/**
 * List all pinned memories
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of pinned memories
 */
async function listPinnedMemories(options = {}) {
  const { limit = 100, category = null } = options;

  const neo4j = getNeo4jService();
  if (!await neo4j.isAvailable()) {
    return [];
  }

  const categoryFilter = category ? 'AND m.category = $category' : '';
  const neo4jInt = require('neo4j-driver').int;

  const result = await neo4j.read(`
    MATCH (m:Memory)
    WHERE m.ipfsCid IS NOT NULL ${categoryFilter}
    RETURN m
    ORDER BY m.ipfsPinnedAt DESC
    LIMIT $limit
  `, { limit: neo4jInt(limit), category });

  return result.map(r => {
    const props = r.m?.properties || {};
    return {
      id: props.id,
      content: props.content?.substring(0, 200) + '...',
      category: props.category,
      cid: props.ipfsCid,
      gatewayUrl: props.ipfsGatewayUrl,
      pinnedAt: props.ipfsPinnedAt,
      qualityScore: props.qualityScore
    };
  });
}

/**
 * Publish memory to Pinata for wider distribution
 * @param {string} memoryId - Memory ID to publish
 * @returns {Promise<Object>} Publication result
 */
async function publishMemoryToPinata(memoryId) {
  const neo4j = getNeo4jService();
  if (!await neo4j.isAvailable()) {
    return { success: false, error: 'Neo4j unavailable' };
  }

  // Get memory CID
  const result = await neo4j.read(`
    MATCH (m:Memory {id: $memoryId})
    RETURN m.ipfsCid as cid, m.content as content
  `, { memoryId });

  const cid = result[0]?.cid;
  if (!cid) {
    return { success: false, error: 'Memory not pinned to local IPFS' };
  }

  // Publish to Pinata
  const pinataResult = await ipfsService.pinByHashToPinata(cid, `memory-${memoryId}`);

  // Update Neo4j with Pinata info
  await neo4j.write(`
    MATCH (m:Memory {id: $memoryId})
    SET m.pinataCid = $pinataCid,
        m.pinataGatewayUrl = $gatewayUrl,
        m.pinataPublishedAt = datetime()
  `, {
    memoryId,
    pinataCid: pinataResult.cid,
    gatewayUrl: pinataResult.gatewayUrl
  });

  return {
    success: true,
    memoryId,
    localCid: cid,
    pinataCid: pinataResult.cid,
    gatewayUrl: pinataResult.gatewayUrl
  };
}

/**
 * Import a memory from IPFS CID
 * @param {string} cid - IPFS CID of the memory
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
async function importMemoryFromCid(cid, options = {}) {
  const { dryRun = false, sourceServerId = null } = options;

  // Fetch memory from IPFS
  const fetchResult = await getMemoryByCid(cid);
  const memory = fetchResult.memory;

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      memory: {
        id: memory.id,
        category: memory.category,
        contentPreview: memory.content?.substring(0, 200)
      }
    };
  }

  // Import the memory
  const neo4j = getNeo4jService();
  if (!await neo4j.isAvailable()) {
    return { success: false, error: 'Neo4j unavailable' };
  }

  // Check if already exists
  const existing = await neo4j.read(`
    MATCH (m:Memory {id: $memoryId})
    RETURN m.id as id
  `, { memoryId: memory.id });

  if (existing[0]) {
    return { success: false, error: 'Memory already exists', memoryId: memory.id };
  }

  // Create the memory
  await neo4j.write(`
    CREATE (m:Memory {
      id: $id,
      content: $content,
      category: $category,
      stage: $stage,
      tags: $tags,
      importance: $importance,
      timestamp: datetime($timestamp),
      context: $context,
      account: $account,
      federationSource: $sourceServerId,
      ipfsCid: $cid,
      importedAt: datetime()
    })
  `, {
    ...memory,
    tags: memory.tags || [],
    sourceServerId: sourceServerId || 'ipfs',
    cid
  });

  // Record attribution if marketplace is available
  if (sourceServerId) {
    const marketplace = getMemoryMarketplaceService();
    await marketplace.recordAttribution(memory.id, sourceServerId);
  }

  return {
    success: true,
    imported: true,
    memoryId: memory.id,
    cid,
    category: memory.category
  };
}

module.exports = {
  initialize,
  pinMemory,
  pinMemoryCollection,
  getMemoryByCid,
  autoPinHighQualityMemories,
  unpinMemory,
  getMemoryIpfsStats,
  listPinnedMemories,
  publishMemoryToPinata,
  importMemoryFromCid,
  AUTO_PIN_QUALITY_THRESHOLD
};
