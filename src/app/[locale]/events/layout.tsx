import TopBar from '@/components/top-bar';
import NavPanel from '@/components/top-bar/nav-panel';
import MainOffset from '@/components/main-offset';
import { NavProvider } from '@/contexts/nav-context';
import { getCurrentTenant } from '@/lib/tenant';

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();
  return (
    <NavProvider>
      <TopBar whatsappEnabled instagramLink={tenant.instagram_link} />
      <NavPanel />
      <MainOffset>
        {children}
      </MainOffset>
    </NavProvider>
  );
}
