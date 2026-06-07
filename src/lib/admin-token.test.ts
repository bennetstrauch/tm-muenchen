import { describe, it, expect, beforeEach } from "vitest";
import { generateToken, verifyToken } from "./admin-token";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

describe("magic-link token", () => {
  it("verifies a freshly generated token for the event it is scoped to", async () => {
    const token = await generateToken("ev-1", "2999-01-01");
    expect(await verifyToken(token, "ev-1")).toEqual({ valid: true });
  });

  it("rejects a token presented for a different event", async () => {
    const token = await generateToken("ev-1", "2999-01-01");
    expect(await verifyToken(token, "ev-2")).toEqual({ valid: false, reason: "invalid" });
  });

  it("reports expiry when the event date plus 30 days is in the past", async () => {
    const token = await generateToken("ev-1", "2000-01-01");
    expect(await verifyToken(token, "ev-1")).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects a token whose signature has been tampered with", async () => {
    const token = await generateToken("ev-1", "2999-01-01");
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(await verifyToken(tampered, "ev-1")).toEqual({ valid: false, reason: "invalid" });
  });

  it("rejects a structurally malformed token", async () => {
    expect(await verifyToken("not-a-token", "ev-1")).toEqual({ valid: false, reason: "invalid" });
  });
});
