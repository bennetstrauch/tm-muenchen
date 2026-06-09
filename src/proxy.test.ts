import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Dependency mocks ──────────────────────────────────────────────────────────

const mockResolveTenantSlug = vi.fn();
const mockVerifySessionToken = vi.fn();
const mockIsAuthorizedAdminApi = vi.fn();

vi.mock("./lib/tenant-edge", () => ({
  resolveTenantSlug: mockResolveTenantSlug,
}));
vi.mock("./lib/admin-session", () => ({
  verifySessionToken: mockVerifySessionToken,
}));
vi.mock("./lib/admin-api-gate", () => ({
  isAuthorizedAdminApi: mockIsAuthorizedAdminApi,
}));
vi.mock("./i18n/routing", () => ({
  routing: {},
}));
// next-intl locale middleware: returns a plain 200 response so tests can
// verify the middleware didn't redirect or error for public routes.
vi.mock("next-intl/middleware", () => ({
  default: () => () => new Response(null, { status: 200 }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetModules();
  mockResolveTenantSlug.mockReset();
  mockVerifySessionToken.mockReset();
  mockIsAuthorizedAdminApi.mockReset();
});

function makeRequest(url: string, opts: { cookie?: string } = {}): NextRequest {
  const headers = new Headers();
  if (opts.cookie) headers.set("cookie", opts.cookie);
  return new NextRequest(url, { headers });
}

async function load() {
  return (await import("./proxy")).proxy;
}

// ── Unknown tenant ────────────────────────────────────────────────────────────

describe("unknown tenant", () => {
  it("redirects to https://tm-muenchen.de", async () => {
    mockResolveTenantSlug.mockResolvedValue(null);
    const middleware = await load();
    const res = await middleware(makeRequest("https://stranger.de/"));
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    // NextResponse.redirect normalises the URL (adds trailing slash).
    expect(res.headers.get("location")).toBe("https://tm-muenchen.de/");
  });
});

// ── Admin UI (/admin/*) ───────────────────────────────────────────────────────

describe("admin UI routes", () => {
  beforeEach(() => mockResolveTenantSlug.mockResolvedValue("muenchen"));

  it("passes /admin/login through without checking the session", async () => {
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/admin/login"));
    expect(res.status).not.toBeGreaterThanOrEqual(300);
    expect(mockVerifySessionToken).not.toHaveBeenCalled();
  });

  it("redirects /admin to /admin/login when there is no session cookie", async () => {
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/admin"));
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects /admin to /admin/login when the session token is invalid", async () => {
    mockVerifySessionToken.mockReturnValue(false);
    const middleware = await load();
    const res = await middleware(
      makeRequest("https://tm-muenchen.de/admin", { cookie: "admin-session=bad-token" }),
    );
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("passes /admin through with a valid session cookie", async () => {
    mockVerifySessionToken.mockReturnValue(true);
    const middleware = await load();
    const res = await middleware(
      makeRequest("https://tm-muenchen.de/admin", { cookie: "admin-session=good-token" }),
    );
    expect(res.status).not.toBeGreaterThanOrEqual(300);
  });

  it("passes /admin through with magic-link query params, no session needed", async () => {
    const middleware = await load();
    const res = await middleware(
      makeRequest("https://tm-muenchen.de/admin?token=abc&event=evt-1"),
    );
    expect(res.status).not.toBeGreaterThanOrEqual(300);
    expect(mockVerifySessionToken).not.toHaveBeenCalled();
  });
});

// ── Admin API (/api/admin/*) ──────────────────────────────────────────────────

describe("admin API routes", () => {
  beforeEach(() => mockResolveTenantSlug.mockResolvedValue("muenchen"));

  it("returns 401 when the request is not authorized", async () => {
    mockIsAuthorizedAdminApi.mockReturnValue(false);
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/api/admin/events"));
    expect(res.status).toBe(401);
  });

  it("passes through when the request is authorized", async () => {
    mockIsAuthorizedAdminApi.mockReturnValue(true);
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/api/admin/events"));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBeGreaterThanOrEqual(300);
  });
});

// ── Public API (/api/*) ───────────────────────────────────────────────────────

describe("public API routes", () => {
  it("passes through without auth checks", async () => {
    mockResolveTenantSlug.mockResolvedValue("muenchen");
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/api/register"));
    expect(res.status).not.toBeGreaterThanOrEqual(300);
    expect(mockIsAuthorizedAdminApi).not.toHaveBeenCalled();
  });
});

// ── Public pages — locale routing ─────────────────────────────────────────────

describe("public pages", () => {
  it("delegates to the next-intl locale middleware", async () => {
    mockResolveTenantSlug.mockResolvedValue("muenchen");
    const middleware = await load();
    const res = await middleware(makeRequest("https://tm-muenchen.de/"));
    // The mock locale middleware returns 200 — no error or redirect from our code.
    expect(res.status).toBe(200);
  });
});
