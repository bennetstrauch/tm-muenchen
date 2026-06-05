import { createHmac, timingSafeEqual } from "crypto";

// HMAC-signed, tamper-evident tokens of the form `base64url(payload).base64url(sig)`.
// This core proves authenticity only — callers own expiry and domain-field policy.

function getSecret(): string {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) throw new Error("ADMIN_TOKEN_SECRET env var is not set");
  return secret;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlEncodeBytes(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const mod4 = padded.length % 4;
  const padding = mod4 === 0 ? "" : "=".repeat(4 - mod4);
  return Buffer.from(padded + padding, "base64").toString("utf8");
}

function computeSig(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

/** Sign a JSON payload. Returns `base64url(payload).base64url(sig)`. */
export function sign(payload: object): string {
  const secret = getSecret();
  const encoded = base64urlEncode(JSON.stringify(payload));
  const sig = base64urlEncodeBytes(computeSig(encoded, secret));
  return `${encoded}.${sig}`;
}

/**
 * Verify a token's signature and return its decoded payload, or null if the
 * token is malformed, tampered with, or signed with a different secret.
 */
export function verify<T>(token: string): T | null {
  const secret = getSecret();

  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const payload = token.slice(0, dotIdx);
  const sigStr = token.slice(dotIdx + 1);

  const expectedSigBuf = computeSig(payload, secret);
  let actualSigBuf: Buffer;
  try {
    const padded = sigStr.replace(/-/g, "+").replace(/_/g, "/");
    const mod4 = padded.length % 4;
    const padding = mod4 === 0 ? "" : "=".repeat(4 - mod4);
    actualSigBuf = Buffer.from(padded + padding, "base64");
  } catch {
    return null;
  }

  if (
    actualSigBuf.length !== expectedSigBuf.length ||
    !timingSafeEqual(actualSigBuf, expectedSigBuf)
  ) {
    return null;
  }

  try {
    return JSON.parse(base64urlDecode(payload)) as T;
  } catch {
    return null;
  }
}
