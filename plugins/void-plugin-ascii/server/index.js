// ASCII Plugin - Server Entry
// This plugin is client-only, no server routes needed

module.exports = function asciiPlugin(app, options = {}) {
  const { mountPath = '/ascii' } = options;

  console.log(`🎨 ASCII Plugin mounted at ${mountPath}`);

  // No server routes - this is a client-only tool
};
