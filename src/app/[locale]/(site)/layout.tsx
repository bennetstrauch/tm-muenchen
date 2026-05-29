import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import NavPanel from "@/components/top-bar/nav-panel";
import MainOffset from "@/components/main-offset";
import CookieBanner from "@/components/cookie-banner";
import { NavProvider } from "@/contexts/nav-context";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <NavProvider>
      <TopBar whatsappEnabled={settings.whatsapp_enabled} whatsappLink={settings.whatsapp_link} />
      <NavPanel />
      <MainOffset>
        {children}
      </MainOffset>
      <StickyCta />
      <CookieBanner />
    </NavProvider>
  );
}
