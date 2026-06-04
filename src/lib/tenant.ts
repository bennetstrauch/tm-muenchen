import { cache } from "react";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { getSupabase } from "./supabase";
import type { Database } from "./supabase";

export type TenantConfig = Database["public"]["Tables"]["tenants"]["Row"];

function normalizeHost(host: string): string {
  return host.replace(/^www\./, "").split(":")[0];
}

// Edge proxy: hostname -> tenant slug. Dev resolves via DEV_TENANT.
// Returns null for unknown hostnames so the proxy can redirect.
export async function resolveTenantSlug(request: NextRequest): Promise<string | null> {
  if (process.env.NODE_ENV === "development") {
    return process.env.DEV_TENANT ?? "muenchen";
  }
  const host = normalizeHost(request.headers.get("host") ?? "");
  const { data } = await getSupabase()
    .from("tenants")
    .select("tenant")
    .eq("hostname", host)
    .single();
  return data?.tenant ?? null;
}

// Server-side: full tenant row for the current request. Wrapped in React cache()
// so it hits Supabase exactly once per request no matter how many callers ask.
export const getCurrentTenant = cache(async (): Promise<TenantConfig> => {
  const slug = (await headers()).get("x-tenant") ?? "muenchen";
  const { data, error } = await getSupabase()
    .from("tenants")
    .select("*")
    .eq("tenant", slug)
    .single();
  if (error || !data) throw new Error(`Unknown tenant: ${slug}`);
  return data;
});
