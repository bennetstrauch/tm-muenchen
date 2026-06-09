import type { NextRequest } from "next/server";

export function normalizeHost(host: string): string {
  return host.replace(/^www\./, "").split(":")[0];
}

const slugCache = new Map<string, string>();

export async function resolveTenantSlug(request: NextRequest): Promise<string | null> {
  if (process.env.NODE_ENV === "development") {
    return process.env.DEV_TENANT ?? "muenchen";
  }

  const host = normalizeHost(request.headers.get("host") ?? "");

  if (slugCache.has(host)) return slugCache.get(host)!;

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return "muenchen";

    const res = await fetch(
      `${url}/rest/v1/tenants?select=tenant&hostname=eq.${encodeURIComponent(host)}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return "muenchen";

    const rows = (await res.json()) as { tenant: string }[];
    const slug = rows[0]?.tenant ?? null;
    if (slug) slugCache.set(host, slug);
    return slug;
  } catch {
    return "muenchen";
  }
}
