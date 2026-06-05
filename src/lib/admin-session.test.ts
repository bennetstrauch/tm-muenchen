import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "./admin-session";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin session token", () => {
  it("verifies a freshly created token against the tenant it was issued for", () => {
    const token = createSessionToken("muenchen");
    expect(verifySessionToken(token, "muenchen")).toBe(true);
  });

  it("rejects a token presented for a different tenant", () => {
    const token = createSessionToken("muenchen");
    expect(verifySessionToken(token, "berlin")).toBe(false);
  });

  it("rejects a token whose signature has been tampered with", () => {
    const token = createSessionToken("muenchen");
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(verifySessionToken(tampered, "muenchen")).toBe(false);
  });

  it("rejects a structurally malformed token", () => {
    expect(verifySessionToken("not-a-token", "muenchen")).toBe(false);
  });

  it("rejects a token once it has expired", () => {
    const token = createSessionToken("muenchen");
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 366 * 24 * 60 * 60 * 1000);
    expect(verifySessionToken(token, "muenchen")).toBe(false);
  });
});
