import { describe, it, expect, beforeEach } from "vitest";
import { generateToken, verifyToken } from "./admin-token";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

describe("magic-link token", () => {
  it("verifies a freshly generated token for the event it is scoped to", () => {
    const token = generateToken("ev-1", "2999-01-01");
    expect(verifyToken(token, "ev-1")).toEqual({ valid: true });
  });

  it("rejects a token presented for a different event", () => {
    const token = generateToken("ev-1", "2999-01-01");
    expect(verifyToken(token, "ev-2")).toEqual({ valid: false, reason: "invalid" });
  });

  it("reports expiry when the event date plus 30 days is in the past", () => {
    const token = generateToken("ev-1", "2000-01-01");
    expect(verifyToken(token, "ev-1")).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects a token whose signature has been tampered with", () => {
    const token = generateToken("ev-1", "2999-01-01");
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(verifyToken(tampered, "ev-1")).toEqual({ valid: false, reason: "invalid" });
  });

  it("rejects a structurally malformed token", () => {
    expect(verifyToken("not-a-token", "ev-1")).toEqual({ valid: false, reason: "invalid" });
  });
});
