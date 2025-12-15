const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Encryption utilities for securing sensitive wallet data
 * Uses AES-256-GCM encryption with auto-generated key
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

const DATA_DIR = path.join(__dirname, '..', 'data');
const SECRET_KEY_PATH = path.join(DATA_DIR, '.secret-key');

let cachedKey = null;

/**
 * Generate a random encryption key
 * @returns {string} - Random 32-byte key as base64
 */
function generateKey() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Load encryption key from file, or create new one if missing
 * @returns {string} - Encryption key
 */
function loadOrCreateKey() {
  if (cachedKey) return cachedKey;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(SECRET_KEY_PATH)) {
    cachedKey = fs.readFileSync(SECRET_KEY_PATH, 'utf8').trim();
    return cachedKey;
  }

  // Generate new key
  const newKey = generateKey();
  fs.writeFileSync(SECRET_KEY_PATH, newKey, { mode: 0o600 });
  console.log('Generated new encryption key for wallet plugin');
  cachedKey = newKey;
  return cachedKey;
}

/**
 * Derive a key from the master password using PBKDF2
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a string (e.g., seed phrase)
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted data as base64 string
 */
function encrypt(text) {
  const masterPassword = loadOrCreateKey();

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from master password
  const key = deriveKey(masterPassword, salt);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag
  const tag = cipher.getAuthTag();

  // Combine salt, iv, tag, and encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt a string (e.g., seed phrase)
 * @param {string} encryptedData - Base64 encrypted data
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData) {
  const masterPassword = loadOrCreateKey();

  // Convert from base64
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Derive key from master password
  const key = deriveKey(masterPassword, salt);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
  generateKey,
  loadOrCreateKey
};
