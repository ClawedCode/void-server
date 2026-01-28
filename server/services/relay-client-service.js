/**
 * Relay Client Service
 *
 * WebSocket client that connects to void-mud relay hub.
 * Enables communication with other void-server peers without PUBLIC_URL.
 * Requires CLAWED token authentication (500K+ threshold).
 */

const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const { broadcast } = require('../utils/broadcast');
const { getPeerService } = require('./peer-service');
const walletService = require('./wallet/wallet-service');
const { getMemorySyncService } = require('./memory-sync-service');

// Default relay URL
const DEFAULT_RELAY_URL = 'https://void-mud.onrender.com';

// Session token persistence file
const SESSION_FILE = path.join(process.cwd(), 'data', 'federation-session.json');

// Federation settings file (stores selected auth wallet, etc.)
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'federation-settings.json');

/**
 * Load federation settings from disk
 */
function loadFederationSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  }
  return {};
}

/**
 * Save federation settings to disk
 */
function saveFederationSettings(settings) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Chunk size for large payloads (64KB)
const CHUNK_SIZE = 64 * 1024;

class RelayClientService {
  constructor() {
    this.socket = null;
    this.relayUrl = null;
    this.federationService = null;
    this.connectedPeers = new Map(); // serverId -> manifest
    this.pendingMessages = new Map(); // messageId -> { resolve, reject, timeout }
    this.messageHandlers = new Map(); // type -> handler function
    this.isConnected = false;
    this.isAuthenticated = false;
    this.sessionToken = null;
    this.sessionExpiresAt = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Load persisted session token from disk
   */
  loadPersistedSession() {
    if (!fs.existsSync(SESSION_FILE)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));

    // Check if session is still valid (with 1 hour buffer)
    if (data.expiresAt && data.expiresAt > Date.now() + 3600000) {
      console.log('🌐 Relay: Loaded persisted session token');
      return data;
    }

    // Expired, remove the file
    fs.unlinkSync(SESSION_FILE);
    console.log('🌐 Relay: Persisted session expired, will re-authenticate');
    return null;
  }

  /**
   * Save session token to disk for persistence across restarts
   */
  persistSession(sessionToken, expiresAt) {
    const data = { sessionToken, expiresAt, savedAt: Date.now() };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
    console.log('🌐 Relay: Session token persisted to disk');
  }

  /**
   * Clear persisted session
   */
  clearPersistedSession() {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  }

  /**
   * Initialize with federation service
   */
  initialize(federationService) {
    this.federationService = federationService;
    this.relayUrl = process.env.RELAY_URL || DEFAULT_RELAY_URL;

    // Don't connect if in DHT-only mode
    if (process.env.FEDERATION_MODE === 'dht') {
      console.log('🌐 Relay: Skipped (FEDERATION_MODE=dht)');
      return;
    }

    this.connect();
  }

  /**
   * Connect to relay hub
   */
  connect() {
    if (this.socket?.connected) return;

    const relayWsUrl = this.relayUrl.replace(/^http/, 'ws');
    console.log(`🌐 Relay: Connecting to ${this.relayUrl}/relay...`);

    this.socket = io(`${relayWsUrl}/relay`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventHandlers();
  }

  /**
   * Setup socket event handlers
   */
  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', async () => {
      console.log('🌐 Relay: Connected to relay hub');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      broadcast('federation:relay-status', {
        connected: true,
        relayUrl: this.relayUrl
      });

      // Authenticate before registering
      const authResult = await this.authenticate();
      if (authResult.success) {
        this.register();
      } else {
        console.log(`🌐 Relay: Auth failed, not registering: ${authResult.error}`);
        broadcast('federation:relay-auth-failed', {
          error: authResult.error,
          balance: authResult.balance,
          threshold: authResult.threshold
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🌐 Relay: Disconnected (${reason})`);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.sessionToken = null;
      this.connectedPeers.clear();

      broadcast('federation:relay-status', {
        connected: false,
        reason
      });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.log(`🌐 Relay: Connection error (attempt ${this.reconnectAttempts}): ${error.message}`);

      broadcast('federation:relay-status', {
        connected: false,
        error: error.message,
        reconnectAttempts: this.reconnectAttempts
      });
    });

    // Peer events
    this.socket.on('relay:peer-joined', (data) => {
      const { serverId, manifest } = data;
      this.connectedPeers.set(serverId, manifest);
      console.log(`🌐 Relay: Peer joined: ${serverId}`);

      // Notify federation service
      if (this.federationService) {
        this.federationService.addPeer(manifest, `relay://${serverId}`);
      }

      // Persist to Neo4j via peer service
      const peerService = getPeerService();
      peerService.handleRelayPeerJoined(serverId, manifest);

      broadcast('federation:peer-update', {
        type: 'joined',
        peer: { serverId, ...manifest, viaRelay: true }
      });
    });

    this.socket.on('relay:peer-left', (data) => {
      const { serverId } = data;
      this.connectedPeers.delete(serverId);
      console.log(`🌐 Relay: Peer left: ${serverId}`);

      // Update peer health in Neo4j
      const peerService = getPeerService();
      peerService.handleRelayPeerLeft(serverId);

      broadcast('federation:peer-update', {
        type: 'left',
        peer: { serverId }
      });
    });

    // Incoming relayed messages
    this.socket.on('relay:message', (envelope, ackCallback) => {
      this.handleIncomingMessage(envelope, ackCallback);
    });

    // Incoming broadcasts
    this.socket.on('relay:broadcast', (payload) => {
      this.handleIncomingBroadcast(payload);
    });

    // Memory updates from treasury
    this.socket.on('relay:memories-updated', (data) => {
      console.log(`🌐 Relay: New memories available (${data.count} new, ${data.total} total)`);
      broadcast('federation:memories-available', {
        count: data.count,
        total: data.total,
        timestamp: data.timestamp
      });
    });

    // Audio updates from peers
    this.socket.on('relay:audio-updated', (data) => {
      console.log(`🌐 Relay: Audio tracks available (${data.count} new, ${data.total} total)`);
      broadcast('federation:audio-available', {
        count: data.count,
        total: data.total,
        timestamp: data.timestamp
      });
    });

    // Register audio message handlers
    this.onMessage('audio_query', (from, payload) => {
      const audioSyncService = require('./audio-sync-service');
      return audioSyncService.exportTracks(payload.filters || {}).then(data => ({
        type: 'audio_query_response',
        success: true,
        data
      }));
    });

    this.onMessage('audio_share', (from, payload) => {
      const audioSyncService = require('./audio-sync-service');
      if (!payload.exportData) {
        return { type: 'audio_share_response', success: false, error: 'No export data' };
      }
      return audioSyncService.importTracks(payload.exportData, {
        skipDuplicates: true,
        dryRun: payload.dryRun || false
      }).then(result => ({ type: 'audio_share_response', ...result }));
    });
  }

  /**
   * Authenticate with relay hub using wallet signature
   * First checks for a valid persisted session, then falls back to fresh auth
   */
  async authenticate() {
    if (!this.federationService?.identity) {
      return { success: false, error: 'No federation identity' };
    }

    // Check for valid persisted session first
    const cached = this.loadPersistedSession();
    if (cached) {
      this.isAuthenticated = true;
      this.sessionToken = cached.sessionToken;
      this.sessionExpiresAt = cached.expiresAt;
      console.log('🌐 Relay: Using persisted session token');
      return { success: true, cached: true };
    }

    // Get wallet for signing (use selected wallet or fall back to first)
    const groups = walletService.getWalletGroups();
    if (!groups?.length || !groups[0].addresses?.length) {
      console.log('🌐 Relay: No wallet configured for federation auth');
      return { success: false, error: 'No wallet configured. Add a wallet to enable federation.' };
    }

    // Check for selected auth wallet in settings
    const settings = loadFederationSettings();
    let authWallet = null;

    if (settings.authWalletPublicKey) {
      // Find the selected wallet
      for (const group of groups) {
        const found = group.addresses?.find(a => a.publicKey === settings.authWalletPublicKey);
        if (found) {
          authWallet = found;
          break;
        }
      }
    }

    // Fall back to first wallet if selected not found
    if (!authWallet) {
      authWallet = groups[0].addresses[0];
    }

    const publicKey = authWallet.publicKey;

    // Create auth message
    const message = JSON.stringify({
      action: 'federation:auth',
      timestamp: Date.now(),
      serverId: this.federationService.identity.serverId
    });

    // Sign the message
    const signResult = walletService.signMessage(publicKey, message);
    if (!signResult.success) {
      return { success: false, error: `Failed to sign: ${signResult.error}` };
    }

    console.log(`🌐 Relay: Authenticating with wallet ${publicKey.slice(0, 8)}...`);

    return new Promise((resolve) => {
      this.socket.emit('relay:auth', {
        publicKey,
        signature: signResult.signature,
        message
      }, (response) => {
        if (response.success) {
          this.isAuthenticated = true;
          this.sessionToken = response.sessionToken;
          this.sessionExpiresAt = response.expiresAt;

          // Persist session for survival across restarts
          this.persistSession(response.sessionToken, response.expiresAt);

          console.log(`🌐 Relay: Authenticated successfully (session expires in 7 days)`);
          resolve({ success: true });
        } else {
          // Clear any stale persisted session on auth failure
          this.clearPersistedSession();
          console.log(`🌐 Relay: Authentication failed: ${response.error}`);
          resolve(response);
        }
      });
    });
  }

  /**
   * Register with relay hub
   */
  register() {
    if (!this.federationService?.identity) {
      console.log('🌐 Relay: Cannot register - no identity');
      return;
    }

    if (!this.isAuthenticated) {
      console.log('🌐 Relay: Cannot register - not authenticated');
      return;
    }

    const manifest = this.federationService.getManifest();

    this.socket.emit('relay:register', manifest, (response) => {
      if (response.success) {
        console.log(`🌐 Relay: Registered as ${manifest.serverId}`);
        console.log(`🌐 Relay: ${response.peers.length} peer(s) online`);

        // Update connected peers
        this.connectedPeers.clear();
        for (const peer of response.peers) {
          this.connectedPeers.set(peer.serverId, peer.manifest);

          // Add to federation service
          if (this.federationService) {
            this.federationService.addPeer(peer.manifest, `relay://${peer.serverId}`);
          }
        }

        broadcast('federation:relay-registered', {
          serverId: manifest.serverId,
          peerCount: response.peers.length
        });
      } else {
        console.log(`🌐 Relay: Registration failed: ${response.error}`);

        // Handle auth required error (session expired or invalid)
        if (response.requiresAuth) {
          console.log('🌐 Relay: Session invalid, clearing cache and re-authenticating...');
          this.isAuthenticated = false;
          this.sessionToken = null;
          this.clearPersistedSession();  // Force fresh auth
          this.authenticate().then(authResult => {
            if (authResult.success) {
              this.register();
            }
          });
        }
      }
    });
  }

  /**
   * Send message to specific peer
   */
  async sendToPeer(targetServerId, type, payload, options = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to relay');
    }

    const messageId = this.generateMessageId();
    const envelope = {
      to: targetServerId,
      type,
      payload,
      messageId,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(messageId);
        reject(new Error('Message timeout'));
      }, options.timeout || 30000);

      this.pendingMessages.set(messageId, { resolve, reject, timeout });

      this.socket.emit('relay:message', envelope, (response) => {
        clearTimeout(timeout);
        this.pendingMessages.delete(messageId);

        if (response.success) {
          resolve(response.ack);
        } else {
          reject(new Error(response.error || 'Message failed'));
        }
      });
    });
  }

  /**
   * Send large payload in chunks
   */
  async sendChunkedToPeer(targetServerId, type, payload) {
    if (!this.isConnected) {
      throw new Error('Not connected to relay');
    }

    const data = JSON.stringify(payload);
    const transferId = this.generateTransferId();
    const chunks = [];

    // Split into chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      chunks.push(data.slice(i, i + CHUNK_SIZE));
    }

    console.log(`🌐 Relay: Sending chunked transfer ${transferId}: ${chunks.length} chunks, ${data.length} bytes`);

    // Start transfer
    this.socket.emit('relay:chunk-start', {
      transferId,
      to: targetServerId,
      type,
      totalChunks: chunks.length,
      totalSize: data.length
    });

    // Send chunks
    for (let i = 0; i < chunks.length; i++) {
      this.socket.emit('relay:chunk-data', {
        transferId,
        chunkIndex: i,
        chunk: chunks[i]
      });

      // Small delay to prevent flooding
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // End transfer
    this.socket.emit('relay:chunk-end', { transferId });

    console.log(`🌐 Relay: Chunked transfer ${transferId} complete`);
  }

  /**
   * Broadcast to all connected peers
   */
  broadcastToAll(type, payload) {
    if (!this.isConnected) return;

    this.socket.emit('relay:broadcast', { type, payload });
  }

  /**
   * Handle incoming relayed message
   */
  handleIncomingMessage(envelope, ackCallback) {
    const { from, type, payload, chunked } = envelope;

    console.log(`🌐 Relay: Received ${type} from ${from}${chunked ? ' (chunked)' : ''}`);

    // Parse chunked payload
    let parsedPayload = payload;
    if (chunked && typeof payload === 'string') {
      parsedPayload = JSON.parse(payload);
    }

    // Check for registered handler
    const handler = this.messageHandlers.get(type);
    if (handler) {
      const response = handler(from, parsedPayload);
      if (typeof ackCallback === 'function') {
        ackCallback(response);
      }
    } else {
      console.log(`🌐 Relay: No handler for message type: ${type}`);
      if (typeof ackCallback === 'function') {
        ackCallback({ received: true, unhandled: true });
      }
    }
  }

  /**
   * Handle incoming broadcast
   */
  handleIncomingBroadcast(payload) {
    const { from, type } = payload;
    console.log(`🌐 Relay: Received broadcast ${type} from ${from}`);

    const handler = this.messageHandlers.get(`broadcast:${type}`);
    if (handler) {
      handler(from, payload);
    }
  }

  /**
   * Register message handler
   */
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Get connected peers
   */
  getConnectedPeers() {
    return Array.from(this.connectedPeers.entries()).map(([serverId, manifest]) => ({
      serverId,
      ...manifest,
      viaRelay: true
    }));
  }

  /**
   * Check if a peer is connected via relay
   */
  isPeerConnected(serverId) {
    return this.connectedPeers.has(serverId);
  }

  /**
   * Get relay status including auth wallet info and available wallets
   */
  getStatus() {
    const groups = walletService.getWalletGroups();
    const settings = loadFederationSettings();

    // Build list of all available wallets
    const availableWallets = [];
    for (const group of groups || []) {
      for (const addr of group.addresses || []) {
        availableWallets.push({
          publicKey: addr.publicKey,
          label: addr.label || group.name || 'Wallet'
        });
      }
    }

    // Determine current auth wallet (selected or first)
    let authWallet = null;
    if (settings.authWalletPublicKey) {
      authWallet = availableWallets.find(w => w.publicKey === settings.authWalletPublicKey);
    }
    if (!authWallet && availableWallets.length > 0) {
      authWallet = availableWallets[0];
    }

    return {
      connected: this.isConnected,
      authenticated: this.isAuthenticated,
      sessionExpiresAt: this.sessionExpiresAt,
      relayUrl: this.relayUrl,
      connectedPeers: this.connectedPeers.size,
      peers: this.getConnectedPeers(),
      authWallet,
      availableWallets
    };
  }

  /**
   * Set the wallet to use for federation auth
   */
  setAuthWallet(publicKey) {
    const settings = loadFederationSettings();
    settings.authWalletPublicKey = publicKey;
    saveFederationSettings(settings);
    console.log(`🌐 Relay: Auth wallet set to ${publicKey.slice(0, 8)}...`);
    return { success: true };
  }

  /**
   * Publish signed memories to void-mud relay
   * Only treasury wallet can publish, but we try and let server validate
   * @param {Object} options - Export options passed to memory sync service
   */
  async publishSignedMemories(options = {}) {
    if (!this.isConnected || !this.isAuthenticated) {
      return { success: false, error: 'Not connected or authenticated to relay' };
    }

    console.log('🌐 Relay: Preparing signed memories for publishing...');

    // Get memory sync service and export signed memories
    const syncService = getMemorySyncService();
    const exportData = await syncService.exportMemories({
      ...options,
      sign: true,
      limit: options.limit || 10000 // Default higher limit for initial publish
    });

    if (!exportData.memories?.length) {
      return { success: false, error: 'No memories to publish' };
    }

    console.log(`🌐 Relay: Publishing ${exportData.memories.length} signed memories...`);

    return new Promise((resolve) => {
      this.socket.emit('relay:publish-memories', {
        memories: exportData.memories,
        manifest: exportData.manifest
      }, (response) => {
        if (response.success) {
          console.log(`🌐 Relay: Published ${response.stored} memories (${response.skipped} duplicates)`);
          broadcast('federation:memories-published', {
            stored: response.stored,
            skipped: response.skipped,
            total: response.total
          });
        } else {
          console.log(`🌐 Relay: Publish failed: ${response.error}`);
        }
        resolve(response);
      });
    });
  }

  /**
   * Publish signed audio tracks to void-mud relay
   * @param {Object} options - Export options { limit, mood }
   */
  async publishSignedAudio(options = {}) {
    if (!this.isConnected || !this.isAuthenticated) {
      return { success: false, error: 'Not connected or authenticated to relay' };
    }

    console.log('🌐 Relay: Preparing signed audio tracks for publishing...');

    const audioSyncService = require('./audio-sync-service');
    const exportData = await audioSyncService.exportTracks({
      ...options,
      sign: true,
      limit: options.limit || 10000
    });

    if (!exportData.tracks?.length) {
      return { success: false, error: 'No audio tracks to publish' };
    }

    console.log(`🌐 Relay: Publishing ${exportData.tracks.length} signed audio tracks...`);

    return new Promise((resolve) => {
      this.socket.emit('relay:publish-audio', {
        tracks: exportData.tracks,
        manifest: exportData.manifest
      }, (response) => {
        if (response.success) {
          console.log(`🌐 Relay: Published ${response.stored} audio tracks (${response.skipped} duplicates)`);
          broadcast('federation:audio-published', {
            stored: response.stored,
            skipped: response.skipped,
            total: response.total
          });
        } else {
          console.log(`🌐 Relay: Audio publish failed: ${response.error}`);
        }
        resolve(response);
      });
    });
  }

  /**
   * Disconnect from relay
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.connectedPeers.clear();
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  /**
   * Generate unique transfer ID
   */
  generateTransferId() {
    return `xfer_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Singleton instance
let instance = null;

function getRelayClient() {
  if (!instance) {
    instance = new RelayClientService();
  }
  return instance;
}

module.exports = {
  RelayClientService,
  getRelayClient
};
