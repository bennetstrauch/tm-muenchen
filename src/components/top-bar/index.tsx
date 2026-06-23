import NavMenu from "./nav-menu";
import TopBarLogo from "./logo";
import ContactButtons from "./contact-buttons";
import ScrollHeader from "./scroll-header";
import { resolveContactLinks } from "@/lib/contact";
import type { TenantConfig } from "@/lib/tenant";

type TopBarTenantSlice = Pick<
  TenantConfig,
  | "whatsapp_enabled"
  | "whatsapp_number"
  | "whatsapp_link"
  | "contact_phone"
  | "contact_email"
  | "instagram_link"
>;

export default function TopBar({
  tenant,
  activeLocales = [],
  transparent = false,
}: {
  tenant: TopBarTenantSlice;
  activeLocales?: string[];
  transparent?: boolean;
}) {
  const contact = resolveContactLinks(tenant);
  return (
    <ScrollHeader transparent={transparent}>
      <NavMenu />
      {/* Absolutely centered so it's always in the true middle of the header */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <TopBarLogo />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ContactButtons {...contact} />
      </div>
    </ScrollHeader>
  );
}
