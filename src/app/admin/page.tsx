import type { Metadata } from 'next';
import { getRegistrations } from '@/lib/sheets';
import type { Registration } from '@/lib/sheets';
import RegistrationsTable from './registrations-table';

export const metadata: Metadata = {
  title: 'Admin – TM München',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let registrations: Registration[] = [];
  let error: string | null = null;

  try {
    registrations = await getRegistrations();
  } catch (e) {
    console.error('Sheets read failed:', e);
    error = 'Anmeldungen konnten nicht geladen werden.';
  }

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
          <div className="flex flex-col items-end gap-2">
            <a
              href="/admin/veranstaltungen"
              className="text-sm text-[#BCA075] hover:underline"
            >
              Veranstaltungen →
            </a>
            <a
              href="https://vercel.com/bennetstrauch-2281s-projects/tm-muenchen/analytics?environment=all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:underline"
            >
              Vercel Analytics →
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium text-gray-700">Infovortrag-Anmeldungen</h2>
          </div>

          {error ? (
            <p className="p-6 text-red-500 text-sm">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">Noch keine Anmeldungen.</p>
          ) : (
            <RegistrationsTable registrations={registrations} />
          )}
        </div>
      </div>
    </div>
  );
}
