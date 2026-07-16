import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import NavPanel from "@/components/top-bar/nav-panel";
import MainOffset from "@/components/main-offset";
import CookieBanner from "@/components/cookie-banner";
import AttributionCapture from "@/components/attribution-capture";
import Footer from "@/components/footer";
import { NavProvider } from "@/contexts/nav-context";
import { getCurrentTenant } from "@/lib/tenant";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

export default async function SiteShell({
  children,
  transparentBar = false,
}: {
  children: ReactNode;
  transparentBar?: boolean;
}) {
  const [tenant, locale] = await Promise.all([getCurrentTenant(), getLocale()]);
  const showCourses = tenant.show_courses && tenant.course_locales.includes(locale);
  return (
    <NavProvider>
      <TopBar tenant={tenant} activeLocales={tenant.active_locales} transparent={transparentBar} />
      <NavPanel activeLocales={tenant.active_locales} showMeditatorsSection={tenant.show_meditators_section} showCourses={showCourses} />
      <MainOffset>{children}</MainOffset>
      <Footer />
      <StickyCta />
      <CookieBanner pixelId={tenant.meta_pixel_id} />
      <AttributionCapture />
    </NavProvider>
  );
}
