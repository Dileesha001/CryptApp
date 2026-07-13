/**
 * fernet.js — Fernet wire-format implementation for React Native / Expo
 *
 * Compatible with Python's cryptography.fernet.Fernet and file_crypt.py.
 *
 * Fernet format:
 *   token = base64url( Version(1) | Timestamp(8) | IV(16) | Ciphertext | HMAC(32) )
 *
 * Fernet key (32 bytes, base64url-encoded):
 *   bytes  0-15 → signing key (HMAC-SHA256)
 *   bytes 16-31 → encryption key (AES-128-CBC)
 *
 * Password mode (file_crypt.py compatible):
 *   output = salt(16) + fernet_token
 *   key = PBKDF2-HMAC-SHA256(password, salt, 600_000 iterations, 32 bytes)
 */

const FERNET_VERSION = 0x80;
const SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 600_000;

// ─── Utilities ──────────────────────────────────────────────────────────────

/** Convert a base64url string to Uint8Array */
export function base64urlToBytes(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Convert Uint8Array to base64url string */
export function bytesToBase64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Convert Uint8Array to plain base64 string */
export function bytesToBase64(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** Convert base64 string to Uint8Array */
export function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Get cryptographically secure random bytes */
function randomBytes(n) {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

/** PKCS7 pad to block size */
function pkcs7Pad(data, blockSize = 16) {
  const padLen = blockSize - (data.length % blockSize);
  const out = new Uint8Array(data.length + padLen);
  out.set(data);
  out.fill(padLen, data.length);
  return out;
}

/** PKCS7 unpad */
function pkcs7Unpad(data) {
  const padLen = data[data.length - 1];
  if (padLen === 0 || padLen > 16) throw new Error('Invalid PKCS7 padding');
  for (let i = data.length - padLen; i < data.length; i++) {
    if (data[i] !== padLen) throw new Error('Invalid PKCS7 padding');
  }
  return data.slice(0, data.length - padLen);
}

// ─── Key Functions ───────────────────────────────────────────────────────────

/**
 * Generate a new random Fernet key.
 * Returns the key as a base64url string (32 bytes → 44 chars).
 */
export function generateKey() {
  return bytesToBase64url(randomBytes(32));
}

/**
 * Parse a Fernet key into { signingKey, encryptionKey } (both Uint8Array).
 */
function parseKey(keyBase64url) {
  const keyBytes = base64urlToBytes(keyBase64url);
  if (keyBytes.length !== 32) throw new Error(`Invalid Fernet key: expected 32 bytes, got ${keyBytes.length}`);
  return {
    signingKey: keyBytes.slice(0, 16),
    encryptionKey: keyBytes.slice(16, 32),
  };
}

/**
 * Derive a Fernet-compatible key from a password using PBKDF2-HMAC-SHA256.
 * @param {string} password
 * @param {Uint8Array} salt - 16 bytes
 * @returns {Promise<string>} base64url-encoded 32-byte key
 */
export async function deriveKeyFromPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 32 bytes × 8
  );
  return bytesToBase64url(new Uint8Array(derived));
}

// ─── Fernet Encrypt / Decrypt ────────────────────────────────────────────────

/**
 * Encrypt raw bytes using a Fernet key.
 * @param {Uint8Array} data - plaintext
 * @param {string} keyBase64url - Fernet key
 * @returns {Promise<Uint8Array>} raw Fernet token bytes (NOT base64-encoded)
 */
export async function fernetEncrypt(data, keyBase64url) {
  const { signingKey, encryptionKey } = parseKey(keyBase64url);

  const iv = randomBytes(16);

  // Timestamp: seconds since epoch as big-endian uint64
  const timestamp = Math.floor(Date.now() / 1000);
  const tsBytes = new Uint8Array(8);
  const tsView = new DataView(tsBytes.buffer);
  tsView.setUint32(0, Math.floor(timestamp / 0x100000000), false);
  tsView.setUint32(4, timestamp >>> 0, false);

  // AES-128-CBC encryption
  const aesCryptoKey = await crypto.subtle.importKey(
    'raw',
    encryptionKey,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );
  const padded = pkcs7Pad(data);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, aesCryptoKey, padded)
  );

  // Build token body: 0x80 || timestamp(8) || iv(16) || ciphertext
  const tokenBody = new Uint8Array(1 + 8 + 16 + ciphertext.length);
  let off = 0;
  tokenBody[off++] = FERNET_VERSION;
  tokenBody.set(tsBytes, off); off += 8;
  tokenBody.set(iv, off);     off += 16;
  tokenBody.set(ciphertext, off);

  // HMAC-SHA256 over token body
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    signingKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, tokenBody));

  // Final token: tokenBody || hmac(32)
  const token = new Uint8Array(tokenBody.length + 32);
  token.set(tokenBody, 0);
  token.set(hmac, tokenBody.length);
  return token;
}

/**
 * Decrypt a raw Fernet token.
 * @param {Uint8Array} tokenBytes - raw Fernet token bytes
 * @param {string} keyBase64url - Fernet key
 * @returns {Promise<Uint8Array>} plaintext bytes
 */
export async function fernetDecrypt(tokenBytes, keyBase64url) {
  const { signingKey, encryptionKey } = parseKey(keyBase64url);
  const token = new Uint8Array(tokenBytes);

  if (token.length < 1 + 8 + 16 + 16 + 32) {
    throw new Error('Token too short to be a valid Fernet token');
  }
  if (token[0] !== FERNET_VERSION) {
    throw new Error(`Unsupported Fernet version: 0x${token[0].toString(16)}`);
  }

  const tokenBody = token.slice(0, token.length - 32);
  const hmac = token.slice(token.length - 32);

  // Verify HMAC
  const hmacKey = await crypto.subtle.importKey(
    'raw',
    signingKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const valid = await crypto.subtle.verify('HMAC', hmacKey, hmac, tokenBody);
  if (!valid) throw new Error('Decryption failed: wrong key or file is corrupted/tampered.');

  // Extract IV and ciphertext
  const iv = tokenBody.slice(9, 25);
  const ciphertext = tokenBody.slice(25);

  // AES-128-CBC decryption
  const aesCryptoKey = await crypto.subtle.importKey(
    'raw',
    encryptionKey,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );
  const decrypted = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesCryptoKey, ciphertext)
  );

  return pkcs7Unpad(decrypted);
}

// ─── High-level API (mirrors file_crypt.py) ──────────────────────────────────

/**
 * Encrypt bytes with a key-file (raw Fernet token output).
 * Compatible with: python file_crypt.py encrypt --key secret.key --in ... --out ...
 */
export async function encryptWithKey(data, keyBase64url) {
  return await fernetEncrypt(data, keyBase64url);
}

/**
 * Decrypt bytes with a key-file.
 * Compatible with: python file_crypt.py decrypt --key secret.key --in ... --out ...
 */
export async function decryptWithKey(tokenBytes, keyBase64url) {
  return await fernetDecrypt(tokenBytes, keyBase64url);
}

/**
 * Encrypt bytes with a password (PBKDF2 → Fernet, prepend 16-byte salt).
 * Compatible with: python file_crypt.py encrypt --password --in ... --out ...
 */
export async function encryptWithPassword(data, password) {
  const salt = randomBytes(SALT_SIZE);
  const key = await deriveKeyFromPassword(password, salt);
  const token = await fernetEncrypt(data, key);
  const output = new Uint8Array(SALT_SIZE + token.length);
  output.set(salt, 0);
  output.set(token, SALT_SIZE);
  return output;
}

/**
 * Decrypt bytes with a password.
 * Compatible with: python file_crypt.py decrypt --password --in ... --out ...
 */
export async function decryptWithPassword(blob, password) {
  const bytes = new Uint8Array(blob);
  const salt = bytes.slice(0, SALT_SIZE);
  const token = bytes.slice(SALT_SIZE);
  const key = await deriveKeyFromPassword(password, salt);
  return await fernetDecrypt(token, key);
}
