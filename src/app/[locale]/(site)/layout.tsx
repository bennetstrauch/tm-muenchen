import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import NavPanel from "@/components/top-bar/nav-panel";
import MainOffset from "@/components/main-offset";
import CookieBanner from "@/components/cookie-banner";
import Footer from "@/components/footer";
import { NavProvider } from "@/contexts/nav-context";
import { getCurrentTenant } from "@/lib/tenant";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();
  return (
    <NavProvider>
      <TopBar whatsappEnabled={tenant.whatsapp_enabled} whatsappLink={tenant.whatsapp_link} whatsappNumber={tenant.whatsapp_number} contactPhone={tenant.contact_phone} instagramLink={tenant.instagram_link} activeLocales={tenant.active_locales} />
      <NavPanel activeLocales={tenant.active_locales} />
      <MainOffset>
        {children}
      </MainOffset>
      <Footer />
      <StickyCta />
      <CookieBanner />
    </NavProvider>
  );
}
