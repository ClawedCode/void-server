const net = require('net');
const dns = require('dns').promises;

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
  if (parts[0] === 0) return true;                                   // 0.0.0.0/8
  if (parts[0] === 10) return true;                                   // 10.0.0.0/8
  if (parts[0] === 127) return true;                                  // 127.0.0.0/8
  if (parts[0] === 169 && parts[1] === 254) return true;             // 169.254.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;             // 192.168.0.0/16
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // 100.64.0.0/10 (CGNAT)
  return false;
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized === '::') return true;                                // unspecified
  if (normalized.startsWith('fe80:')) return true;                     // link-local
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local
  if (normalized.startsWith('::ffff:')) {                              // IPv4-mapped IPv6
    const mapped = normalized.slice('::ffff:'.length);
    if (net.isIP(mapped) === 4) return isPrivateIPv4(mapped);
  }
  return false;
}

function isPrivateHost(hostname) {
  if (!hostname) return true;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true;
  if (hostname.endsWith('.local')) return true;
  if (hostname.endsWith('.internal')) return true;

  const ipType = net.isIP(hostname);
  if (ipType === 4) return isPrivateIPv4(hostname);
  if (ipType === 6) return isPrivateIPv6(hostname);

  // Non-IP hostnames could DNS-rebind to private IPs — flag in validation result
  // for callers to resolve DNS and re-check if needed
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

  // For non-IP hostnames, resolve DNS and check resolved addresses
  const needsDnsCheck = !allowPrivate && !isAllowlisted(url, allowlist) && net.isIP(url.hostname) === 0;

  return { ok: true, url, needsDnsCheck };
}

/**
 * Async version that resolves DNS to prevent rebinding attacks
 */
async function validateFederationEndpointAsync(endpoint, options = {}) {
  const result = validateFederationEndpoint(endpoint, options);
  if (!result.ok || !result.needsDnsCheck) return result;

  const addresses = await dns.resolve4(result.url.hostname).catch(() => []);
  const addresses6 = await dns.resolve6(result.url.hostname).catch(() => []);
  const allAddresses = [...addresses, ...addresses6];

  for (const addr of allAddresses) {
    if (net.isIP(addr) === 4 && isPrivateIPv4(addr)) {
      return { ok: false, reason: 'endpoint resolves to private address' };
    }
    if (net.isIP(addr) === 6 && isPrivateIPv6(addr)) {
      return { ok: false, reason: 'endpoint resolves to private address' };
    }
  }

  return { ok: true, url: result.url };
}

module.exports = {
  validateFederationEndpoint,
  validateFederationEndpointAsync
};
