import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ── Supabase mock (shared across all tests in this file) ──────────────────────

const single = vi.fn();
const eqSpy = vi.fn(() => ({ single }));
const from = vi.fn(() => ({ select: () => ({ eq: eqSpy }) }));
vi.mock("./supabase", () => ({ getSupabase: () => ({ from }) }));

// ── NODE_ENV helpers ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  single.mockReset();
  from.mockClear();
  eqSpy.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function setNodeEnv(env: string) {
  vi.stubEnv("NODE_ENV", env);
}

async function load() {
  return import("./tenant-edge");
}

// Minimal NextRequest-shaped stub — only what resolveTenantSlug uses.
function fakeRequest(host: string | null): { headers: { get(k: string): string | null } } {
  return { headers: { get: (k: string) => (k === "host" ? host : null) } };
}

// ── normalizeHost ─────────────────────────────────────────────────────────────

describe("normalizeHost", () => {
  it("strips www. prefix", async () => {
    const { normalizeHost } = await load();
    expect(normalizeHost("www.tm-muenchen.de")).toBe("tm-muenchen.de");
  });

  it("strips port number", async () => {
    const { normalizeHost } = await load();
    expect(normalizeHost("tm-muenchen.de:3000")).toBe("tm-muenchen.de");
  });

  it("strips both www. and port together", async () => {
    const { normalizeHost } = await load();
    expect(normalizeHost("www.tm-muenchen.de:443")).toBe("tm-muenchen.de");
  });

  it("leaves a clean hostname unchanged", async () => {
    const { normalizeHost } = await load();
    expect(normalizeHost("tm-muenchen.de")).toBe("tm-muenchen.de");
  });
});

// ── resolveTenantSlug — development mode ──────────────────────────────────────

describe("resolveTenantSlug (development)", () => {
  beforeEach(() => setNodeEnv("development"));

  it("returns the DEV_TENANT env var", async () => {
    vi.stubEnv("DEV_TENANT", "berlin");
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest(null) as never)).toBe("berlin");
  });

  it("falls back to 'muenchen' when DEV_TENANT is unset", async () => {
    // DEV_TENANT intentionally not stubbed
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest(null) as never)).toBe("muenchen");
  });

  it("never calls Supabase in dev mode", async () => {
    const { resolveTenantSlug } = await load();
    await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never);
    expect(from).not.toHaveBeenCalled();
  });
});

// ── resolveTenantSlug — production mode ───────────────────────────────────────

describe("resolveTenantSlug (production)", () => {
  it("returns the tenant slug for a known hostname", async () => {
    single.mockResolvedValue({ data: { tenant: "muenchen" }, error: null });
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never)).toBe("muenchen");
  });

  it("returns null for an unknown hostname", async () => {
    single.mockResolvedValue({ data: null, error: { message: "no rows" } });
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("unknown.de") as never)).toBeNull();
  });

  it("normalises the hostname before querying Supabase (strips www. and port)", async () => {
    single.mockResolvedValue({ data: { tenant: "muenchen" }, error: null });
    const { resolveTenantSlug } = await load();
    await resolveTenantSlug(fakeRequest("www.tm-muenchen.de:443") as never);
    expect(eqSpy).toHaveBeenCalledWith("hostname", "tm-muenchen.de");
  });
});
