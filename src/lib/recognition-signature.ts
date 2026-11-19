import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies predictions signed by the recognition backend (backend/app.py,
 * `sign_prediction`). The canonical payload must match the Python side exactly:
 *   `${label}|${confidence.toFixed(4)}|${issuedAt}|${nonce}`
 *
 * Replay protection: the nonce is stored on RecognitionAttempt with a unique
 * index, so a signed result can only ever be redeemed once.
 */

/** Signed results older than this are rejected. */
export const SIGNATURE_MAX_AGE_SECONDS = 120;

export interface SignedResult {
  predictedLabel: string;
  confidence: number;
  issuedAt: number;
  nonce: string;
  signature: string;
}

export type VerifyOutcome =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'missing' | 'malformed' | 'expired' | 'invalid' };

export function signingSecret(): string | null {
  return process.env.RECOGNITION_SIGNING_SECRET || null;
}

export function canonicalPayload(label: string, confidence: number, issuedAt: number, nonce: string): string {
  return `${label}|${confidence.toFixed(4)}|${issuedAt}|${nonce}`;
}

export function verifyRecognition(
  input: Partial<SignedResult>,
  now: number = Math.floor(Date.now() / 1000),
): VerifyOutcome {
  const secret = signingSecret();
  if (!secret) return { ok: false, reason: 'not_configured' };

  const { predictedLabel, confidence, issuedAt, nonce, signature } = input;
  if (!signature || !nonce || typeof issuedAt !== 'number') return { ok: false, reason: 'missing' };
  if (
    typeof predictedLabel !== 'string' ||
    typeof confidence !== 'number' ||
    !/^[a-f0-9]{24}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return { ok: false, reason: 'malformed' };
  }
  // Allow a little clock skew into the future.
  if (issuedAt > now + 30 || now - issuedAt > SIGNATURE_MAX_AGE_SECONDS) {
    return { ok: false, reason: 'expired' };
  }

  const expected = createHmac('sha256', secret)
    .update(canonicalPayload(predictedLabel, confidence, issuedAt, nonce))
    .digest();
  const given = Buffer.from(signature, 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true };
}
