import { sign, verify } from "./signed-token";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface MagicLinkPayload {
  eventId: string;
  exp: number;
}

/**
 * Generate a magic-link token scoped to a specific event.
 *
 * @param eventId   The event ID (from Veranstaltungen sheet)
 * @param eventDate ISO date string "YYYY-MM-DD" — expiry is this date + 30 days
 * @returns         Token string: `base64url(payload).base64url(sig)`
 */
export function generateToken(eventId: string, eventDate: string): string {
  const exp = Math.floor((Date.parse(eventDate) + THIRTY_DAYS_MS) / 1000);
  return sign({ eventId, exp } satisfies MagicLinkPayload);
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
): { valid: true } | { valid: false; reason: "expired" | "invalid" } {
  const parsed = verify<MagicLinkPayload>(token);
  if (!parsed || parsed.eventId !== eventId) {
    return { valid: false, reason: "invalid" };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (parsed.exp <= nowSeconds) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}
