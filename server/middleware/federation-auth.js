const crypto = require('crypto');

const DEFAULT_ALLOW_PATHS = new Set(['/manifest', '/identity', '/ping']);

// Lazy load federation service to avoid circular dependencies
let federationServiceInstance = null;
function getFederationServiceLazy() {
  if (!federationServiceInstance) {
    const { getFederationService } = require('../services/federation-service');
    federationServiceInstance = getFederationService();
  }
  return federationServiceInstance;
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function isLoopbackAddress(ip) {
  if (!ip) return false;
  if (ip === '127.0.0.1' || ip === '::1') return true;
  if (ip.startsWith('::ffff:127.')) return true;
  return false;
}

function getAuthToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  const alt = req.headers['x-federation-token'];
  if (typeof alt === 'string' && alt.trim()) return alt.trim();
  return null;
}

function requireFederationAuth(options = {}) {
  const allowPaths = options.allowPaths || DEFAULT_ALLOW_PATHS;
  const requiredRole = options.role || null;

  return (req, res, next) => {
    const mode = process.env.FEDERATION_AUTH_MODE || 'off';
    const allowLocal = process.env.FEDERATION_AUTH_ALLOW_LOCAL !== 'false';
    const isLocal = allowLocal && isLoopbackAddress(req.ip || req.connection?.remoteAddress);

    if (allowPaths.has(req.path)) {
      req.federationAuth = { mode, role: 'public', isLocal };
      return next();
    }

    if (mode === 'off') {
      req.federationAuth = { mode, role: 'bypass', isLocal };
      return next();
    }

    if (isLocal) {
      req.federationAuth = { mode, role: 'local', isLocal: true };
      return next();
    }

    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Federation auth token required' });
    }

    const adminToken = process.env.FEDERATION_ADMIN_TOKEN;
    const peerToken = process.env.FEDERATION_AUTH_TOKEN || adminToken;

    let role = null;
    if (adminToken && safeEqual(token, adminToken)) {
      role = 'admin';
    } else if (peerToken && safeEqual(token, peerToken)) {
      role = 'peer';
    }

    if (!role) {
      return res.status(403).json({ success: false, error: 'Invalid federation auth token' });
    }

    if (requiredRole === 'admin' && role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin role required' });
    }

    req.federationAuth = { mode, role, isLocal: false };
    return next();
  };
}

function requireFederationRole(role) {
  return (req, res, next) => {
    const mode = process.env.FEDERATION_AUTH_MODE || 'off';
    if (mode === 'off') return next();

    const currentRole = req.federationAuth?.role;
    if (role === 'admin' && currentRole !== 'admin' && currentRole !== 'local') {
      return res.status(403).json({ success: false, error: 'Admin role required' });
    }

    if (role === 'peer' && !['peer', 'admin', 'local'].includes(currentRole)) {
      return res.status(403).json({ success: false, error: 'Peer role required' });
    }

    return next();
  };
}

/**
 * Verify a peer's identity signature.
 * Peers must sign {serverId, timestamp} with their Ed25519 private key.
 * We verify using the peer's known public key to prevent identity spoofing.
 *
 * @param {string} serverId - The claimed peer server ID
 * @param {string} signature - Base58-encoded Ed25519 signature
 * @param {string} timestamp - ISO timestamp or unix ms from the request
 * @param {string} publicKey - The peer's known public key (base58)
 * @param {number} maxAgeMs - Maximum age of the signature (default: 5 minutes)
 * @returns {boolean}
 */
function verifyPeerIdentity(serverId, signature, timestamp, publicKey, maxAgeMs = 300000) {
  if (!serverId || !signature || !publicKey) return false;

  const federation = getFederationServiceLazy();

  // Verify the signature matches the message {serverId, timestamp}
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) || Date.now() : (timestamp || Date.now());
  const age = Math.abs(Date.now() - ts);
  if (age > maxAgeMs) return false;

  const message = { serverId, timestamp: ts };
  return federation.verify(message, signature, publicKey);
}

/**
 * Middleware to require a minimum peer trust level for memory operations.
 * Trust levels in order: unknown < seen < verified < trusted
 *
 * When FEDERATION_AUTH_MODE is enabled, peers must provide a signed identity proof
 * via x-federation-signature and x-federation-timestamp headers (or body fields)
 * to prevent identity spoofing through self-reported requesterIds.
 *
 * @param {string|string[]} requiredLevels - Required trust level(s), e.g., 'verified' or ['verified', 'trusted']
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowAdmin - Allow admin role to bypass trust check (default: true)
 * @param {boolean} options.allowLocal - Allow local requests to bypass trust check (default: true)
 */
function requirePeerTrustLevel(requiredLevels, options = {}) {
  const allowAdmin = options.allowAdmin !== false;
  const allowLocal = options.allowLocal !== false;
  const levels = Array.isArray(requiredLevels) ? requiredLevels : [requiredLevels];

  return (req, res, next) => {
    // Check if trust gating is disabled
    const trustGatingEnabled = process.env.FEDERATION_TRUST_GATING !== 'false';
    if (!trustGatingEnabled) {
      return next();
    }

    // Allow admin to bypass if configured
    if (allowAdmin && req.federationAuth?.role === 'admin') {
      return next();
    }

    // Allow local requests to bypass if configured
    if (allowLocal && req.federationAuth?.isLocal) {
      return next();
    }

    // Get requester ID from body or header
    const requesterId = req.body?.requesterId || req.headers['x-federation-server-id'];

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        error: 'requesterId required for trust-gated operations'
      });
    }

    // Look up the peer
    const federation = getFederationServiceLazy();
    const peer = federation.getPeer(requesterId);

    if (!peer) {
      return res.status(403).json({
        success: false,
        error: `Unknown peer: ${requesterId}. Add as peer first.`
      });
    }

    // When auth mode is active, require cryptographic identity proof
    const authMode = process.env.FEDERATION_AUTH_MODE || 'off';
    if (authMode !== 'off') {
      if (!peer.publicKey) {
        return res.status(403).json({
          success: false,
          error: 'Peer has no public key on record — cannot verify identity'
        });
      }

      const signature = req.headers['x-federation-signature'] || req.body?.requesterSignature;
      const timestamp = req.headers['x-federation-timestamp'] || req.body?.requesterTimestamp;

      if (!signature) {
        return res.status(401).json({
          success: false,
          error: 'Peer identity signature required (x-federation-signature header)'
        });
      }

      if (!verifyPeerIdentity(requesterId, signature, timestamp, peer.publicKey)) {
        return res.status(403).json({
          success: false,
          error: 'Invalid peer identity signature — requesterId does not match signing key'
        });
      }
    }

    const peerTrustLevel = peer.trustLevel || 'unknown';

    if (!levels.includes(peerTrustLevel)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient trust level. Required: ${levels.join(' or ')}. Current: ${peerTrustLevel}`
      });
    }

    // Attach verified peer info to request for downstream use
    req.federationPeer = peer;
    return next();
  };
}

module.exports = {
  requireFederationAuth,
  requireFederationRole,
  requirePeerTrustLevel
};
