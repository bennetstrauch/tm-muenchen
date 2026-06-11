import { sign, verify } from "./signed-token";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  sub: string;
  exp: number;
}

export async function createSession(subject: string): Promise<string> {
  const exp = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return sign({ sub: subject, exp } satisfies SessionPayload);
}

export async function verifySession(token: string, subject: string): Promise<boolean> {
  const parsed = await verify<SessionPayload>(token);
  if (!parsed || parsed.sub !== subject) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsed.exp > nowSeconds;
}
