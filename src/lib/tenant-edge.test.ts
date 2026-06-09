import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
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

function fakeRequest(host: string | null): { headers: { get(k: string): string | null } } {
  return { headers: { get: (k: string) => (k === "host" ? host : null) } };
}

function mockFetch(rows: { tenant: string }[], ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    json: async () => rows,
  } as Response);
}

function stubSupabaseEnv() {
  vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
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
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest(null) as never)).toBe("muenchen");
  });

  it("never calls fetch in dev mode", async () => {
    const fetchSpy = mockFetch([]);
    const { resolveTenantSlug } = await load();
    await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ── resolveTenantSlug — production mode ───────────────────────────────────────

describe("resolveTenantSlug (production)", () => {
  beforeEach(() => stubSupabaseEnv());

  it("returns the tenant slug for a known hostname", async () => {
    mockFetch([{ tenant: "muenchen" }]);
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never)).toBe("muenchen");
  });

  it("returns null for an unknown hostname", async () => {
    mockFetch([]);
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("unknown.de") as never)).toBeNull();
  });

  it("normalises the hostname before querying (strips www. and port)", async () => {
    const fetchSpy = mockFetch([{ tenant: "muenchen" }]);
    const { resolveTenantSlug } = await load();
    await resolveTenantSlug(fakeRequest("www.tm-muenchen.de:443") as never);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("hostname=eq.tm-muenchen.de"),
      expect.anything(),
    );
  });

  it("caches the result so fetch is only called once per hostname", async () => {
    const fetchSpy = mockFetch([{ tenant: "muenchen" }]);
    const { resolveTenantSlug } = await load();
    await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never);
    await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to 'muenchen' when env vars are missing", async () => {
    vi.unstubAllEnvs();
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never)).toBe("muenchen");
  });

  it("falls back to 'muenchen' when fetch throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never)).toBe("muenchen");
  });

  it("falls back to 'muenchen' when fetch returns non-ok", async () => {
    mockFetch([], false);
    const { resolveTenantSlug } = await load();
    expect(await resolveTenantSlug(fakeRequest("tm-muenchen.de") as never)).toBe("muenchen");
  });
});
