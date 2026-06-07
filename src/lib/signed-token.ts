// HMAC-signed, tamper-evident tokens: `base64url(payload).base64url(sig)`.
// Uses Web Crypto API (SubtleCrypto) — compatible with both Edge and Node.js runtimes.
// Callers own expiry and domain-field policy.

function getSecret(): string {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) throw new Error("ADMIN_TOKEN_SECRET env var is not set");
  return secret;
}

function stringToBase64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToString(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const mod4 = padded.length % 4;
  const padding = mod4 === 0 ? '' : '='.repeat(4 - mod4);
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function bytesToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const mod4 = padded.length % 4;
  const padding = mod4 === 0 ? '' : '='.repeat(4 - mod4);
  const binary = atob(padded + padding);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage,
  );
}

/** Sign a JSON payload. Returns `base64url(payload).base64url(sig)`. */
export async function sign(payload: object): Promise<string> {
  const encoded = stringToBase64url(JSON.stringify(payload));
  const key = await importKey(getSecret(), ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded));
  return `${encoded}.${bytesToBase64url(sig)}`;
}

/**
 * Verify a token's signature and return its decoded payload, or null if the
 * token is malformed, tampered with, or signed with a different secret.
 */
export async function verify<T>(token: string): Promise<T | null> {
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return null;

  const payload = token.slice(0, dotIdx);
  const sigStr = token.slice(dotIdx + 1);

  let sigBytes: Uint8Array<ArrayBuffer>;
  try {
    sigBytes = base64urlToBytes(sigStr);
  } catch {
    return null;
  }

  const key = await importKey(getSecret(), ['verify']);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(payload),
  );
  if (!valid) return null;

  try {
    return JSON.parse(base64urlToString(payload)) as T;
  } catch {
    return null;
  }
}
