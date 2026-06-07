import type { NextRequest } from "next/server";
import { getSupabase } from "./supabase";

export function normalizeHost(host: string): string {
  return host.replace(/^www\./, "").split(":")[0];
}

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
