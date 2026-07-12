import { getCurrentTenant } from "@/lib/tenant";
import { buildLocalBusinessJsonLd } from "@/lib/seo";

export default async function LocalBusinessJsonLd() {
  const tenant = await getCurrentTenant();
  const jsonLd = buildLocalBusinessJsonLd(tenant);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
