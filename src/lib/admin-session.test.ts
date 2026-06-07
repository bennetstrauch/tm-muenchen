import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "./admin-session";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin session token", () => {
  it("verifies a freshly created token against the tenant it was issued for", async () => {
    const token = await createSessionToken("muenchen");
    expect(await verifySessionToken(token, "muenchen")).toBe(true);
  });

  it("rejects a token presented for a different tenant", async () => {
    const token = await createSessionToken("muenchen");
    expect(await verifySessionToken(token, "berlin")).toBe(false);
  });

  it("rejects a token whose signature has been tampered with", async () => {
    const token = await createSessionToken("muenchen");
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(await verifySessionToken(tampered, "muenchen")).toBe(false);
  });

  it("rejects a structurally malformed token", async () => {
    expect(await verifySessionToken("not-a-token", "muenchen")).toBe(false);
  });

  it("rejects a token once it has expired", async () => {
    const token = await createSessionToken("muenchen");
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 366 * 24 * 60 * 60 * 1000);
    expect(await verifySessionToken(token, "muenchen")).toBe(false);
  });
});
