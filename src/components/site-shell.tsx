import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import NavPanel from "@/components/top-bar/nav-panel";
import MainOffset from "@/components/main-offset";
import CookieBanner from "@/components/cookie-banner";
import Footer from "@/components/footer";
import { NavProvider } from "@/contexts/nav-context";
import { getCurrentTenant } from "@/lib/tenant";
import type { ReactNode } from "react";

export default async function SiteShell({
  children,
  transparentBar = false,
}: {
  children: ReactNode;
  transparentBar?: boolean;
}) {
  const tenant = await getCurrentTenant();
  return (
    <NavProvider>
      <TopBar tenant={tenant} activeLocales={tenant.active_locales} transparent={transparentBar} />
      <NavPanel activeLocales={tenant.active_locales} showMeditatorsSection={tenant.show_meditators_section} />
      <MainOffset>{children}</MainOffset>
      <Footer />
      <StickyCta />
      <CookieBanner pixelId={tenant.meta_pixel_id} />
    </NavProvider>
  );
}
