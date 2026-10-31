/**
 * @module session
 * @description Session lifecycle management: creation, AES-256-GCM token encryption,
 * cookie handling and session lookup. Each server restart generates a new in-memory
 * encryption key which deliberately invalidates any live OAuth tokens from previous
 * processes, preventing stale credential reuse.
 */

import { cookieValue } from '../utils/cookies.js';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { one, write } from '../models/store.js';
import { examples } from '../../../database/seed.js';

// ─── Encryption key ───────────────────────────────────────────────────────────

/**
 * Ephemeral 256-bit key generated once per process.
 * Intentionally discarded on restart to invalidate persisted live tokens.
 *
 * @type {Buffer}
 */
const key = randomBytes(32);

// ─── Token sealing ────────────────────────────────────────────────────────────

/**
 * Encrypt an arbitrary value using AES-256-GCM with a random IV.
 * The resulting Base64 string encodes: [12-byte IV | 16-byte tag | ciphertext].
 *
 * @param {*} value - JSON-serialisable value to encrypt.
 * @returns {string} Base64-encoded authenticated ciphertext.
 */
export function seal(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  return encrypt(cipher, iv, value);
}

/**
 * Internal helper: finalise encryption and pack IV + auth tag + ciphertext.
 *
 * @param {import('node:crypto').CipherGCM} cipher - Active GCM cipher instance.
 * @param {Buffer} iv    - 12-byte initialisation vector.
 * @param {*}      value - Value to serialise and encrypt.
 * @returns {string} Base64-encoded result.
 */
function encrypt(cipher, iv, value) {
  const data = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

/**
 * Decrypt a sealed value produced by {@link seal}.
 * Verifies the GCM authentication tag before returning plaintext.
 *
 * @param {string} value - Base64-encoded sealed string.
 * @returns {*} Original decrypted value.
 * @throws {Error} If the authentication tag is invalid (tampered data).
 */
export function unseal(value) {
  const b = Buffer.from(value, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, b.subarray(0, 12));
  decipher.setAuthTag(b.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(b.subarray(28)), decipher.final()]).toString());
}

// ─── Session CRUD ─────────────────────────────────────────────────────────────

/**
 * Create a new session row and seed demo messages when in demo mode.
 *
 * @param {'demo'|'live'} mode  - Session type.
 * @param {object|null}   token - OAuth token credentials (live mode only).
 * @returns {string} New session ID (64-char hex).
 */
export function createSession(mode = 'demo', token = null) {
  const id = randomBytes(32).toString('hex');

  write(
    'INSERT INTO sessions VALUES(?,?,?,?)',
    id,
    mode,
    token ? seal(token) : null,
    Date.now(),
  );

  // Populate inbox with example messages for demo sessions.
  if (mode === 'demo') {
    examples.forEach((m, i) => {
      write(
        'INSERT INTO messages VALUES(?,?,?,?,?,?)',
        String(i + 1),
        id,
        ...m,
        JSON.stringify(['INBOX', 'UNREAD']),
      );
    });
  }

  return id;
}

/**
 * Look up a session from the `arcade` cookie. Sessions expire after 24 hours.
 *
 * @param {import('express').Request} req - Incoming request.
 * @returns {object|null} Session row, or null if absent / expired.
 */
export function session(req) {
  const cookie = cookieValue(req, 'arcade');
  return cookie && one(
    'SELECT * FROM sessions WHERE id=? AND created>?',
    cookie,
    Date.now() - 86_400_000,
  );
}

/**
 * Set the `arcade` session cookie on the response.
 * Uses `HttpOnly`, `SameSite=Lax` and `Secure` (in production) flags.
 *
 * @param {import('express').Response} res - Outgoing response.
 * @param {string}                     id  - Session ID to store.
 */
export function setCookie(res, id) {
  res.cookie('arcade', id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86_400_000,
    path: '/',
  });
}
