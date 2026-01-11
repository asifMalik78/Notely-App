/**
 * OAuth State Utilities
 * Uses HMAC for secure stateless state verification
 */

import crypto from 'crypto';
import { env } from '../config/env.js';

const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a secure OAuth state parameter
 * Format: timestamp.randomBytes.hmacSignature
 */
export function generateOAuthState(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${timestamp}.${random}`;

  const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');

  return `${data}.${signature}`;
}

/**
 * Verify OAuth state parameter
 * Returns true if valid and not expired
 */
export function verifyOAuthState(state: string): boolean {
  if (!state) return false;

  const parts = state.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, random, signature] = parts;
  const data = `${timestamp}.${random}`;

  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
  hmac.update(data);
  const expectedSignature = hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  // Check expiry
  const stateTime = parseInt(timestamp, 10);
  if (isNaN(stateTime) || Date.now() - stateTime > STATE_EXPIRY_MS) {
    return false;
  }

  return true;
}
