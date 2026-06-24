import type { Metadata } from 'next';
import { getCurrentTenant } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { city } = await getCurrentTenant();
  return { title: `Admin – TM ${city}` };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
