/**
 * Audio Sync Service
 *
 * Handles cross-instance audio track sharing for federation:
 * - Content hashing for deduplication (fingerprint-based)
 * - Selective export by mood or timestamp
 * - Delta sync support (only new tracks since last sync)
 * - Import with collision detection
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { getFederationService } = require('./federation-service');
const libraryService = require('./audio-library-service');
const walletService = require('./wallet/wallet-service');
const memorySigningService = require('./memory-signing-service');

const SYNC_STATE_PATH = path.join(process.cwd(), 'data', 'audio', 'sync-state.json');

/**
 * Generate signed identity headers for outbound trust-gated requests.
 */
function signedIdentityHeaders(federation) {
  const timestamp = Date.now();
  const signature = federation.sign({ serverId: federation.identity.serverId, timestamp });
  return {
    'x-federation-server-id': federation.identity.serverId,
    'x-federation-signature': signature,
    'x-federation-timestamp': String(timestamp)
  };
}

/**
 * Generate content hash for deduplication
 * Uses SHA-256 of fingerprint data (musical structure, not raw code)
 */
function generateAudioContentHash(track) {
  const fp = track.fingerprint;
  const content = {
    mood: track.mood,
    structuralHash: fp?.structuralHash || '',
    codeLength: fp?.codeLength || 0,
    bpm: fp?.bpm || 0,
    synthTypes: (fp?.synthTypes || []).map(s => s.type || s).sort(),
    effectTypes: (fp?.effectTypes || []).map(e => e.type || e).sort()
  };
  return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/**
 * Normalize track for federation export
 * Strips local fields, adds federation metadata
 */
function normalizeTrackForExport(track, audioCode, sourceServerId) {
  return {
    id: track.id,
    mood: track.mood,
    fingerprint: track.fingerprint || null,
    audioCode,
    generatedAt: track.generatedAt,
    source: track.source,
    federation: {
      sourceServerId,
      contentHash: generateAudioContentHash(track),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  };
}

/**
 * Prepare a federated track for local import
 * Generates local ID with provenance tracking
 */
function prepareTrackForImport(federatedTrack, importedBy) {
  const sourcePrefix = (federatedTrack.federation?.sourceServerId || 'unknown').replace('void-', '').slice(0, 8);
  const originalId = federatedTrack.id.slice(0, 20);
  const localId = `fed_${sourcePrefix}_${originalId}`;

  return {
    id: localId,
    mood: federatedTrack.mood,
    fingerprint: federatedTrack.fingerprint || null,
    audioCode: federatedTrack.audioCode,
    generatedAt: federatedTrack.generatedAt,
    source: 'federation',
    provenance: {
      sourceServerId: federatedTrack.federation.sourceServerId,
      originalId: federatedTrack.id,
      contentHash: federatedTrack.federation.contentHash,
      importedAt: new Date().toISOString(),
      importedBy
    }
  };
}

// ---- Sync State (file-based) ----

async function loadSyncState() {
  const exists = await fs.access(SYNC_STATE_PATH).then(() => true).catch(() => false);
  if (!exists) return {};
  const content = await fs.readFile(SYNC_STATE_PATH, 'utf-8');
  return JSON.parse(content);
}

async function saveSyncState(state) {
  const dir = path.dirname(SYNC_STATE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SYNC_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

async function getSyncState(peerId) {
  const state = await loadSyncState();
  return state[peerId] || null;
}

async function updateSyncState(peerId, data) {
  const state = await loadSyncState();
  state[peerId] = {
    ...(state[peerId] || {}),
    ...data,
    updatedAt: new Date().toISOString()
  };
  await saveSyncState(state);
}

// ---- Core Service ----

/**
 * Get content hashes of all local tracks for deduplication
 */
async function getExistingContentHashes() {
  const hashes = new Set();
  const tracks = await libraryService.getAllTracks();

  for (const track of tracks) {
    hashes.add(generateAudioContentHash(track));
  }

  return hashes;
}

/**
 * Export tracks for federation sharing
 */
async function exportTracks(options = {}) {
  const federation = getFederationService();
  const sourceServerId = federation.identity.serverId;

  // Get tracks with filters
  let tracks = await libraryService.getAllTracks(
    options.mood ? { mood: options.mood } : {}
  );

  // Delta sync - only tracks since timestamp
  if (options.since) {
    const sinceDate = new Date(options.since);
    tracks = tracks.filter(t => new Date(t.generatedAt) > sinceDate);
  }

  // Limit
  if (options.limit) {
    tracks = tracks.slice(0, options.limit);
  }

  // Load full track data and normalize
  const exportedTracks = [];
  for (const track of tracks) {
    const full = await libraryService.getTrackById(track.id);
    if (!full?.audioCode) continue;
    exportedTracks.push(normalizeTrackForExport(full, full.audioCode, sourceServerId));
  }

  // Sign if requested
  const shouldSign = options.sign !== false;
  let signingWallet = options.signingWallet;
  let signingErrors = [];

  if (shouldSign) {
    if (!signingWallet) {
      const groups = walletService.getWalletGroups();
      if (groups?.length && groups[0].addresses?.length) {
        signingWallet = groups[0].addresses[0].publicKey;
      }
    }

    if (signingWallet) {
      const signResult = memorySigningService.signMemoriesForExport(exportedTracks, signingWallet);
      // Replace tracks with signed versions
      exportedTracks.length = 0;
      exportedTracks.push(...signResult.signed);
      signingErrors = signResult.errors;
    }
  }

  // Create manifest
  const manifest = {
    version: '1.0',
    type: 'audio',
    sourceServerId,
    sourcePublicKey: federation.identity.publicKey,
    signingWallet: signingWallet || null,
    signed: shouldSign && !!signingWallet,
    exportedAt: new Date().toISOString(),
    filters: options,
    count: exportedTracks.length,
    contentHashes: exportedTracks.map(t => t.federation.contentHash)
  };

  const signature = federation.sign(manifest);

  return {
    manifest,
    signature,
    tracks: exportedTracks,
    signingErrors: signingErrors.length > 0 ? signingErrors : undefined
  };
}

/**
 * Import tracks from another server
 */
async function importTracks(exportData, options = {}) {
  const federation = getFederationService();
  const { manifest, signature, tracks } = exportData;

  // Verify manifest signature
  const isSelfImport = manifest.sourceServerId === federation.identity.serverId;

  if (!isSelfImport) {
    const peer = federation.getPeer(manifest.sourceServerId);
    if (!peer) {
      return { success: false, error: `Unknown source server: ${manifest.sourceServerId}. Add as peer first.` };
    }
    const isValid = federation.verify(manifest, signature, peer.publicKey);
    if (!isValid) {
      return { success: false, error: 'Invalid signature - manifest may have been tampered with' };
    }
  } else {
    const isValid = federation.verify(manifest, signature, federation.identity.publicKey);
    if (!isValid) {
      return { success: false, error: 'Invalid signature on self-import' };
    }
  }

  // Dedup check
  const existingHashes = await getExistingContentHashes();
  const results = { imported: 0, skipped: 0, duplicates: [], errors: [] };

  for (const track of tracks) {
    const contentHash = track.federation.contentHash;

    if (existingHashes.has(contentHash)) {
      results.skipped++;
      results.duplicates.push({ id: track.id, contentHash, reason: 'Content already exists' });
      continue;
    }

    if (options.dryRun) {
      results.imported++;
      continue;
    }

    // Prepare for import
    const local = prepareTrackForImport(track, federation.identity.serverId);

    const created = await libraryService.addTrack(local.id, local.audioCode, {
      mood: local.mood,
      fingerprint: local.fingerprint,
      generatedAt: local.generatedAt,
      source: 'federation',
      provenance: local.provenance
    }).catch(err => {
      results.errors.push({ id: track.id, error: err.message });
      return null;
    });

    if (created) {
      results.imported++;
      existingHashes.add(contentHash);
    }
  }

  // Update sync state
  if (!options.dryRun && results.imported > 0) {
    await updateSyncState(manifest.sourceServerId, {
      lastSync: new Date().toISOString(),
      tracksImported: (await getSyncState(manifest.sourceServerId))?.tracksImported
        ? (await getSyncState(manifest.sourceServerId)).tracksImported + results.imported
        : results.imported,
      lastManifest: { count: manifest.count, exportedAt: manifest.exportedAt }
    });
  }

  return {
    success: true,
    dryRun: options.dryRun || false,
    source: manifest.sourceServerId,
    ...results
  };
}

/**
 * Delta sync with a specific peer
 */
async function deltaSync(peerId) {
  const federation = getFederationService();
  const peer = federation.getPeer(peerId);

  if (!peer) {
    return { success: false, error: 'Peer not found' };
  }

  const syncState = await getSyncState(peerId);
  const since = syncState?.lastSync || null;

  const url = `${peer.endpoint.replace(/\/$/, '')}/api/federation/audio/export`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...signedIdentityHeaders(federation) },
    body: JSON.stringify({
      since,
      requesterId: federation.identity.serverId
    }),
    signal: AbortSignal.timeout(60000)
  }).catch(err => ({ ok: false, error: err.message }));

  if (!response.ok) {
    return { success: false, error: response.error || 'Failed to fetch from peer' };
  }

  const data = await response.json();
  if (!data.success) {
    return { success: false, error: data.error };
  }

  return importTracks(data.data, { skipDuplicates: true });
}

/**
 * Get sync statistics
 */
async function getStats() {
  const allTracks = await libraryService.getAllTracks();
  const federatedTracks = allTracks.filter(t => t.source === 'federation');

  const bySource = {};
  for (const t of federatedTracks) {
    const src = t.provenance?.sourceServerId || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  }

  const syncStates = await loadSyncState();

  return {
    totalLocal: allTracks.length,
    totalFederated: federatedTracks.length,
    bySource,
    syncStates
  };
}

module.exports = {
  generateAudioContentHash,
  normalizeTrackForExport,
  prepareTrackForImport,
  exportTracks,
  importTracks,
  deltaSync,
  getStats,
  getSyncState,
  updateSyncState,
  getExistingContentHashes
};
