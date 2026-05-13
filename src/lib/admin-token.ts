import { createHmac, timingSafeEqual } from 'crypto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) throw new Error('ADMIN_TOKEN_SECRET env var is not set');
  return secret;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlEncodeBytes(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(s: string): string {
  // Re-pad to valid base64
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const mod4 = padded.length % 4;
  const padding = mod4 === 0 ? '' : '='.repeat(4 - mod4);
  return Buffer.from(padded + padding, 'base64').toString('utf8');
}

function computeSig(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

/**
 * Generate a magic-link token scoped to a specific event.
 *
 * @param eventId   The event ID (from Veranstaltungen sheet)
 * @param eventDate ISO date string "YYYY-MM-DD" — expiry is this date + 30 days
 * @returns         Token string: `base64url(payload).base64url(sig)`
 */
export function generateToken(eventId: string, eventDate: string): string {
  const secret = getSecret();
  const exp = Math.floor((Date.parse(eventDate) + THIRTY_DAYS_MS) / 1000);
  const payload = base64urlEncode(JSON.stringify({ eventId, exp }));
  const sig = base64urlEncodeBytes(computeSig(payload, secret));
  return `${payload}.${sig}`;
}

/**
 * Verify a magic-link token.
 *
 * @param token    Token string as produced by generateToken
 * @param eventId  The event ID that the token is claimed to be scoped to
 */
export function verifyToken(
  token: string,
  eventId: string,
): { valid: true } | { valid: false; reason: 'expired' | 'invalid' } {
  const secret = getSecret();

  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return { valid: false, reason: 'invalid' };

  const payload = token.slice(0, dotIdx);
  const sigStr = token.slice(dotIdx + 1);

  // Recompute expected sig and compare with timing-safe equal
  const expectedSigBuf = computeSig(payload, secret);
  let actualSigBuf: Buffer;
  try {
    const padded = sigStr.replace(/-/g, '+').replace(/_/g, '/');
    const mod4 = padded.length % 4;
    const padding = mod4 === 0 ? '' : '='.repeat(4 - mod4);
    actualSigBuf = Buffer.from(padded + padding, 'base64');
  } catch {
    return { valid: false, reason: 'invalid' };
  }

  if (
    actualSigBuf.length !== expectedSigBuf.length ||
    !timingSafeEqual(actualSigBuf, expectedSigBuf)
  ) {
    return { valid: false, reason: 'invalid' };
  }

  // Decode and validate payload
  let parsed: { eventId: string; exp: number };
  try {
    parsed = JSON.parse(base64urlDecode(payload)) as { eventId: string; exp: number };
  } catch {
    return { valid: false, reason: 'invalid' };
  }

  if (parsed.eventId !== eventId) {
    return { valid: false, reason: 'invalid' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (parsed.exp <= nowSeconds) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true };
}
