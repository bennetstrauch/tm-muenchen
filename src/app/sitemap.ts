import type { MetadataRoute } from "next";
import { getCurrentTenant } from "@/lib/tenant";
import { routing } from "@/i18n/routing";
import { buildSitemapEntries } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getCurrentTenant();
  return buildSitemapEntries(tenant.hostname, [...routing.locales]);
}
