import { describe, it, expect, beforeEach } from "vitest";
import { isAuthorizedAdminApi } from "./admin-api-gate";
import { createSession } from "./admin-session";
import { generateToken } from "./admin-token";

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

const FUTURE = "2999-01-01";

describe("admin API gate", () => {
  it("rejects an unauthenticated request to a protected route", async () => {
    expect(await isAuthorizedAdminApi("/api/admin/einstellungen", "muenchen", {})).toBe(false);
  });

  it("leaves the login route open (it is the auth itself)", async () => {
    expect(await isAuthorizedAdminApi("/api/admin/login", "muenchen", {})).toBe(true);
  });

  it("admits a full-admin session cookie to any admin route", async () => {
    const sessionToken = await createSession("muenchen");
    expect(await isAuthorizedAdminApi("/api/admin/einstellungen", "muenchen", { sessionToken })).toBe(true);
    expect(await isAuthorizedAdminApi("/api/admin/lehrer", "muenchen", { sessionToken })).toBe(true);
  });

  it("rejects a session cookie issued for a different tenant", async () => {
    const sessionToken = await createSession("berlin");
    expect(await isAuthorizedAdminApi("/api/admin/einstellungen", "muenchen", { sessionToken })).toBe(false);
  });

  it("admits a valid magic-link token to the Leiter routes", async () => {
    const tokenHeader = await generateToken("evt-1", FUTURE);
    const creds = { tokenHeader, tokenEvent: "evt-1" };
    expect(await isAuthorizedAdminApi("/api/admin/email-send", "muenchen", creds)).toBe(true);
    expect(await isAuthorizedAdminApi("/api/admin/email-actions", "muenchen", creds)).toBe(true);
    expect(await isAuthorizedAdminApi("/api/admin/email-actions/abc", "muenchen", creds)).toBe(true);
    expect(await isAuthorizedAdminApi("/api/admin/events/evt-1", "muenchen", creds)).toBe(true);
  });

  it("denies a valid magic-link token outside the Leiter routes", async () => {
    const tokenHeader = await generateToken("evt-1", FUTURE);
    const creds = { tokenHeader, tokenEvent: "evt-1" };
    expect(await isAuthorizedAdminApi("/api/admin/einstellungen", "muenchen", creds)).toBe(false);
    expect(await isAuthorizedAdminApi("/api/admin/lehrer", "muenchen", creds)).toBe(false);
    expect(await isAuthorizedAdminApi("/api/admin/tmw-sync", "muenchen", creds)).toBe(false);
  });

  it("rejects a tampered magic-link token on a Leiter route", async () => {
    const tokenHeader = await generateToken("evt-1", FUTURE);
    const tampered = tokenHeader.slice(0, -1) + (tokenHeader.endsWith("A") ? "B" : "A");
    expect(
      await isAuthorizedAdminApi("/api/admin/email-send", "muenchen", { tokenHeader: tampered, tokenEvent: "evt-1" }),
    ).toBe(false);
  });

  it("does not match Leiter paths by prefix coincidence", async () => {
    const tokenHeader = await generateToken("evt-1", FUTURE);
    expect(
      await isAuthorizedAdminApi("/api/admin/events-secret", "muenchen", { tokenHeader, tokenEvent: "evt-1" }),
    ).toBe(false);
  });
});
