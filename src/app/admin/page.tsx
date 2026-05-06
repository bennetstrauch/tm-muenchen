import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getRegistrations } from '@/lib/sheets';
import { getAllVeranstaltungen, getEventRegistrations } from '@/lib/veranstaltungen';
import { getAllVorlagen } from '@/lib/vorlagen';
import AdminClient from './admin-client';

export const metadata: Metadata = {
  title: 'Admin – TM München',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [infoRegistrations, events, eventRegistrations, vorlagen] = await Promise.all([
    getRegistrations().catch(() => []),
    getAllVeranstaltungen().catch(() => []),
    getEventRegistrations().catch(() => []),
    getAllVorlagen().catch(() => []),
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
              Transzendentale Meditation · München
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
          />
        </Suspense>

      </div>
    </div>
  );
}
