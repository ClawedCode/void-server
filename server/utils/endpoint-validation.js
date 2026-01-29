const net = require('net');

function parseAllowlist(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fe80:')) return true; // link-local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local
  return false;
}

function isPrivateHost(hostname) {
  if (!hostname) return true;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true;
  if (hostname.endsWith('.local')) return true;

  const ipType = net.isIP(hostname);
  if (ipType === 4) return isPrivateIPv4(hostname);
  if (ipType === 6) return isPrivateIPv6(hostname);
  return false;
}

function isAllowlisted(url, allowlist) {
  if (!allowlist.length) return false;
  return allowlist.some(entry => {
    if (entry.includes('://')) {
      return url.origin === entry || url.href.startsWith(entry);
    }
    return url.hostname === entry;
  });
}

function validateFederationEndpoint(endpoint, options = {}) {
  const allowPrivate = options.allowPrivate || process.env.FEDERATION_ALLOW_PRIVATE_ENDPOINTS === 'true';
  const allowlist = options.allowlist || parseAllowlist(process.env.FEDERATION_ENDPOINT_ALLOWLIST);

  if (!endpoint || typeof endpoint !== 'string') {
    return { ok: false, reason: 'endpoint required' };
  }

  let url;
  try {
    url = new URL(endpoint);
  } catch (err) {
    return { ok: false, reason: 'invalid endpoint URL' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported endpoint protocol' };
  }

  if (!allowPrivate && !isAllowlisted(url, allowlist) && isPrivateHost(url.hostname)) {
    return { ok: false, reason: 'endpoint not allowed' };
  }

  return { ok: true, url };
}

module.exports = {
  validateFederationEndpoint
};
