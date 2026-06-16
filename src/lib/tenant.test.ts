import { vi, describe, it, expect, beforeEach } from "vitest";

// Stand in for React's per-request cache() with a single-entry memo so the
// dedup contract is observable in a plain test: production uses the real one.
vi.mock("react", async (orig) => {
  const actual = await orig<typeof import("react")>();
  return {
    ...actual,
    cache: <T extends (...a: never[]) => unknown>(fn: T) => {
      let memo: unknown;
      let called = false;
      return (...a: Parameters<T>) => {
        if (!called) { memo = fn(...a); called = true; }
        return memo;
      };
    },
  };
});

const single = vi.fn();
const from = vi.fn(() => ({
  select: () => ({ eq: () => ({ single }) }),
}));
vi.mock("./supabase", () => ({ getSupabase: () => ({ from }) }));

let xTenant: string | null = "muenchen";
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (k: string) => (k === "x-tenant" ? xTenant : null) }),
}));

const muenchen = { tenant: "muenchen", hostname: "tm-muenchen.de", city: "München" };

const freiburg = {
  tenant: "freiburg",
  hostname: "tm-freiburg.de",
  city: "Freiburg",
  logo_url: null,
  logo_label: null,
  infoabend_duration_minutes: 45,
  show_teachers: false,
  center_banner_label: "TM CENTER FREIBURG IM BREISGAU",
};

beforeEach(() => {
  vi.resetModules();
  single.mockReset();
  from.mockClear();
  xTenant = "muenchen";
});

async function load() {
  return (await import("./tenant")).getCurrentTenant;
}

describe("getCurrentTenant", () => {
  it("returns the tenant config for the slug in the x-tenant header", async () => {
    xTenant = "muenchen";
    single.mockResolvedValue({ data: muenchen, error: null });
    const getCurrentTenant = await load();
    expect(await getCurrentTenant()).toEqual(muenchen);
  });

  it("defaults to muenchen when no x-tenant header is present", async () => {
    xTenant = null;
    single.mockResolvedValue({ data: muenchen, error: null });
    const getCurrentTenant = await load();
    await getCurrentTenant();
    expect(from).toHaveBeenCalledWith("tenants");
  });

  it("throws when the tenant is unknown", async () => {
    xTenant = "atlantis";
    single.mockResolvedValue({ data: null, error: { message: "no rows" } });
    const getCurrentTenant = await load();
    await expect(getCurrentTenant()).rejects.toThrow("Unknown tenant: atlantis");
  });

  it("exposes ui customisation fields from the tenant row", async () => {
    xTenant = "freiburg";
    single.mockResolvedValue({ data: freiburg, error: null });
    const getCurrentTenant = await load();
    const config = await getCurrentTenant();
    expect(config.infoabend_duration_minutes).toBe(45);
    expect(config.show_teachers).toBe(false);
    expect(config.center_banner_label).toBe("TM CENTER FREIBURG IM BREISGAU");
    expect(config.logo_url).toBeNull();
    expect(config.logo_label).toBeNull();
  });

  it("hits Supabase only once when called twice in the same request", async () => {
    single.mockResolvedValue({ data: muenchen, error: null });
    const getCurrentTenant = await load();
    await getCurrentTenant();
    await getCurrentTenant();
    expect(single).toHaveBeenCalledTimes(1);
  });
});
