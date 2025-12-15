/**
 * Verify Plugin Server Entry
 *
 * This plugin is primarily client-side (signature verification).
 * The server entry point is minimal - just for plugin registration.
 */

module.exports = (app, config = {}) => {
  const mountPath = config.mountPath || '/verify';

  // No server routes needed - verification is done client-side
  // This entry point exists for plugin system compatibility

  console.log(`🛡️ Verify Plugin mounted at ${mountPath}`);
};
