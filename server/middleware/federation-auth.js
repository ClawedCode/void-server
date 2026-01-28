const DEFAULT_ALLOW_PATHS = new Set(['/manifest', '/identity', '/ping']);

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
    if (adminToken && token === adminToken) {
      role = 'admin';
    } else if (peerToken && token === peerToken) {
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
    if (role === 'admin' && currentRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin role required' });
    }

    return next();
  };
}

module.exports = {
  requireFederationAuth,
  requireFederationRole
};
