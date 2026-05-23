import StickyCta from "@/components/sticky-cta";
import TopBar from "@/components/top-bar";
import NavPanel from "@/components/top-bar/nav-panel";
import MainOffset from "@/components/main-offset";
import { NavProvider } from "@/contexts/nav-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <TopBar />
      <NavPanel />
      <MainOffset>
        {children}
      </MainOffset>
      <StickyCta />
    </NavProvider>
  );
}
