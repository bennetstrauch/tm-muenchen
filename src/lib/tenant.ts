import { cache } from "react";
import { headers } from "next/headers";
import { getSupabase } from "./supabase";
import type { Database } from "./supabase";

export type TenantConfig = Database["public"]["Tables"]["tenants"]["Row"];

// The subset of a tenant row that the admin Einstellungen tab may read and edit.
export type TenantSettings = Pick<
  TenantConfig,
  "active_locales" | "whatsapp_enabled" | "whatsapp_link" | "whatsapp_number" | "contact_email" | "contact_phone" | "center_image_url" | "infoabend_duration_minutes" | "show_meditators_section"
>;

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
