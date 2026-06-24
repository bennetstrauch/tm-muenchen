import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getInfoAnmeldungen } from '@/lib/info-anmeldungen';
import { getAllVeranstaltungen, getEventRegistrations } from '@/lib/veranstaltungen';
import { getAllVorlagen } from '@/lib/vorlagen';
import { verifyToken } from '@/lib/admin-token';
import { verifySession } from '@/lib/admin-session';
import { getCurrentTenant } from '@/lib/tenant';
import { getEmailActions } from '@/lib/email-actions';
import AdminClient from './admin-client';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  return { title: `Admin – TM ${tenant.city}` };
}

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tokenParam = typeof params.token === 'string' ? params.token : undefined;
  const eventParam = typeof params.event === 'string' ? params.event : undefined;

  // --- Token-scoped access (magic link) ---
  if (tokenParam && eventParam) {
    const result = await verifyToken(tokenParam, eventParam);
    if (!result.valid) {
      // Invalid or expired token — send to login
      redirect('/admin/login');
    }

    // Valid token: load data and render in token-scoped mode
    const { tenant: tenantSlug, city } = await getCurrentTenant();
    const [infoRegistrations, events, eventRegistrations, vorlagen, emailActions] = await Promise.all([
      getInfoAnmeldungen(tenantSlug).catch(() => []),
      getAllVeranstaltungen(tenantSlug).catch(() => []),
      getEventRegistrations(tenantSlug).catch(() => []),
      getAllVorlagen(tenantSlug).catch(() => []),
      getEmailActions().catch(() => []),
    ]);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#BCA075] mb-1">
                Transzendentale Meditation · {city}
              </p>
              <h1 className="text-2xl font-semibold text-gray-800">Anmeldungen</h1>
            </div>
          </div>

          <Suspense>
            <AdminClient
              infoRegistrations={infoRegistrations}
              initialEvents={events}
              eventRegistrations={eventRegistrations}
              initialVorlagen={vorlagen}
              initialEmailActions={emailActions}
              tokenEventId={eventParam}
              tokenHeader={tokenParam}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // --- Normal session-based access ---
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;
  const { tenant, city, can_edit_copy } = await getCurrentTenant();

  if (!sessionToken || !await verifySession(sessionToken, tenant)) {
    redirect('/admin/login');
  }

  const [infoRegistrations, events, eventRegistrations, vorlagen, emailActions] = await Promise.all([
    getInfoAnmeldungen(tenant).catch(() => []),
    getAllVeranstaltungen(tenant).catch(() => []),
    getEventRegistrations(tenant).catch(() => []),
    getAllVorlagen(tenant).catch(() => []),
    getEmailActions().catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 mb-3 inline-block">
              ← Zur Website
            </a>
            <p className="text-xs tracking-widest uppercase text-[#BCA075] mb-1">
              Transzendentale Meditation · {city}
            </p>
            <h1 className="text-2xl font-semibold text-gray-800">Admin</h1>
          </div>
          <a
            href="https://vercel.com/bennetstrauch-2281s-projects/tm-muenchen/analytics?environment=all"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:underline"
          >
            Vercel Analytics →
          </a>
        </div>

        <Suspense>
          <AdminClient
            infoRegistrations={infoRegistrations}
            initialEvents={events}
            eventRegistrations={eventRegistrations}
            initialVorlagen={vorlagen}
            initialEmailActions={emailActions}
            canEditCopy={can_edit_copy}
          />
        </Suspense>

      </div>
    </div>
  );
}
