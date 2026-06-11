import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSession, verifySession } from "./admin-session";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin session", () => {
  it("verifies a freshly created token against the subject it was issued for", async () => {
    const token = await createSession("muenchen");
    expect(await verifySession(token, "muenchen")).toBe(true);
  });

  it("rejects a token presented for a different subject", async () => {
    const token = await createSession("muenchen");
    expect(await verifySession(token, "berlin")).toBe(false);
  });

  it("accepts a super-admin token verified against 'super-admin'", async () => {
    const token = await createSession("super-admin");
    expect(await verifySession(token, "super-admin")).toBe(true);
  });

  it("rejects a tenant token when verified as super-admin", async () => {
    const token = await createSession("muenchen");
    expect(await verifySession(token, "super-admin")).toBe(false);
  });

  it("rejects a token whose signature has been tampered with", async () => {
    const token = await createSession("muenchen");
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(await verifySession(tampered, "muenchen")).toBe(false);
  });

  it("rejects a structurally malformed token", async () => {
    expect(await verifySession("not-a-token", "muenchen")).toBe(false);
  });

  it("rejects a token once it has expired", async () => {
    const token = await createSession("muenchen");
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 366 * 24 * 60 * 60 * 1000);
    expect(await verifySession(token, "muenchen")).toBe(false);
  });
});
