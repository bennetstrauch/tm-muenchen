import type { Metadata } from 'next';
import { getAllVeranstaltungen, getEventRegistrations } from '@/lib/veranstaltungen';
import { getAllVorlagen } from '@/lib/vorlagen';
import EventsClient from './events-client';

export const metadata: Metadata = {
  title: 'Veranstaltungen – Admin TM München',
};

export const dynamic = 'force-dynamic';

export default async function AdminVeranstaltungenPage() {
  const [events, registrations, vorlagen] = await Promise.all([
    getAllVeranstaltungen().catch(() => []),
    getEventRegistrations().catch(() => []),
    getAllVorlagen().catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600 mb-3 inline-block">
            ← Admin
          </a>
          <p className="text-xs tracking-widest uppercase text-[#BCA075] mb-1">
            Transzendentale Meditation · München
          </p>
          <h1 className="text-2xl font-semibold text-gray-800">Veranstaltungen</h1>
        </div>

        <EventsClient initialEvents={events} registrations={registrations} initialVorlagen={vorlagen} />

      </div>
    </div>
  );
}
