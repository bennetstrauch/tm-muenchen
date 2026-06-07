import { sign, verify } from "./signed-token";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface MagicLinkPayload {
  eventId: string;
  exp: number;
}

export async function generateToken(eventId: string, eventDate: string): Promise<string> {
  const exp = Math.floor((Date.parse(eventDate) + THIRTY_DAYS_MS) / 1000);
  return sign({ eventId, exp } satisfies MagicLinkPayload);
}

export async function verifyToken(
  token: string,
  eventId: string,
): Promise<{ valid: true } | { valid: false; reason: 'expired' | 'invalid' }> {
  const parsed = await verify<MagicLinkPayload>(token);
  if (!parsed || parsed.eventId !== eventId) {
    return { valid: false, reason: 'invalid' };
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (parsed.exp <= nowSeconds) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true };
}
