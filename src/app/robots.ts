import type { MetadataRoute } from "next";
import { getCurrentTenant } from "@/lib/tenant";
import { buildRobots } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await getCurrentTenant();
  return buildRobots(tenant.hostname);
}
