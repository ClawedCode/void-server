/**
 * Memory Signing Service
 *
 * Signs memories with Ed25519 wallet keys for federation authenticity.
 * Uses wallet service for actual signing, adds federation metadata.
 */

const walletService = require('./wallet/wallet-service');
const nacl = require('tweetnacl');
const bs58Pkg = require('bs58');
const bs58 = bs58Pkg.default || bs58Pkg;

/**
 * Sign a memory's content hash with wallet key
 * @param {Object} memory - Memory object with federation.contentHash
 * @param {string} publicKey - Wallet public key to sign with
 * @returns {Object} Memory with added signature fields
 */
function signMemory(memory, publicKey) {
  if (!memory.federation?.contentHash) {
    return { success: false, error: 'Memory missing contentHash' };
  }

  const result = walletService.signMessage(publicKey, memory.federation.contentHash);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Add signature to federation metadata
  const signedMemory = {
    ...memory,
    federation: {
      ...memory.federation,
      signature: result.signature,
      signer: publicKey,
      signedAt: new Date().toISOString()
    }
  };

  return { success: true, memory: signedMemory };
}

/**
 * Verify a memory's signature
 * @param {Object} memory - Memory with federation signature
 * @returns {Object} { valid: boolean, error?: string, signer?: string }
 */
function verifyMemorySignature(memory) {
  if (!memory.federation?.signature || !memory.federation?.signer || !memory.federation?.contentHash) {
    return { valid: false, error: 'Missing signature fields' };
  }

  const signature = bs58.decode(memory.federation.signature);
  const publicKey = bs58.decode(memory.federation.signer);
  const messageBytes = Buffer.from(memory.federation.contentHash, 'utf-8');

  const valid = nacl.sign.detached.verify(messageBytes, signature, publicKey);

  return {
    valid,
    signer: memory.federation.signer,
    contentHash: memory.federation.contentHash
  };
}

/**
 * Sign multiple memories for export
 * @param {Array} memories - Array of memories to sign
 * @param {string} publicKey - Wallet public key
 * @returns {Object} { signed: [], errors: [], total: number }
 */
function signMemoriesForExport(memories, publicKey) {
  const signed = [];
  const errors = [];

  for (const memory of memories) {
    const result = signMemory(memory, publicKey);

    if (result.success) {
      signed.push(result.memory);
    } else {
      errors.push({
        id: memory.id,
        error: result.error
      });
    }
  }

  return {
    success: errors.length === 0,
    signed,
    errors,
    total: memories.length
  };
}

/**
 * Verify multiple memories
 * @param {Array} memories - Array of memories to verify
 * @returns {Object} { valid: [], invalid: [], total: number }
 */
function verifyMemories(memories) {
  const valid = [];
  const invalid = [];

  for (const memory of memories) {
    const result = verifyMemorySignature(memory);

    if (result.valid) {
      valid.push(memory);
    } else {
      invalid.push({
        id: memory.id,
        error: result.error || 'Invalid signature'
      });
    }
  }

  return {
    success: invalid.length === 0,
    valid,
    invalid,
    total: memories.length
  };
}

/**
 * Get the signing wallet from federation config
 * Returns the wallet configured for federation authentication
 */
function getSigningWallet() {
  // Import federation config to get the auth wallet
  const federationConfig = require('../config/federation');
  return federationConfig.getAuthWallet?.() || null;
}

/**
 * Check if a memory is signed
 * @param {Object} memory - Memory to check
 * @returns {boolean}
 */
function isSigned(memory) {
  return !!(memory.federation?.signature && memory.federation?.signer);
}

/**
 * Check if a memory needs signing (has contentHash but no signature)
 * @param {Object} memory - Memory to check
 * @returns {boolean}
 */
function needsSigning(memory) {
  return !!(memory.federation?.contentHash && !memory.federation?.signature);
}

module.exports = {
  signMemory,
  verifyMemorySignature,
  signMemoriesForExport,
  verifyMemories,
  getSigningWallet,
  isSigned,
  needsSigning
};
