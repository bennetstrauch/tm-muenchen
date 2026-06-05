import { sign, verify } from "./signed-token";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  tenant: string;
  exp: number;
}

/** Issue a signed admin session token scoped to a tenant, valid for one year. */
export function createSessionToken(tenant: string): string {
  const exp = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return sign({ tenant, exp } satisfies SessionPayload);
}

/** True if the token is a valid, unexpired session for the given tenant. */
export function verifySessionToken(token: string, expectedTenant: string): boolean {
  const parsed = verify<SessionPayload>(token);
  if (!parsed || parsed.tenant !== expectedTenant) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsed.exp > nowSeconds;
}
