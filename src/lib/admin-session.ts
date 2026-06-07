import { sign, verify } from "./signed-token";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  tenant: string;
  exp: number;
}

export async function createSessionToken(tenant: string): Promise<string> {
  const exp = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return sign({ tenant, exp } satisfies SessionPayload);
}

export async function verifySessionToken(token: string, expectedTenant: string): Promise<boolean> {
  const parsed = await verify<SessionPayload>(token);
  if (!parsed || parsed.tenant !== expectedTenant) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsed.exp > nowSeconds;
}
