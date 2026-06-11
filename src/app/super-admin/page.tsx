import { getSupabase } from '@/lib/supabase';
import type { TenantConfig } from '@/lib/tenant';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const { data: tenants } = await getSupabase()
    .from('tenants')
    .select('*')
    .order('tenant');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#BCA075] mb-1">Super-Admin</p>
            <h1 className="text-2xl font-semibold text-gray-800">Tenants</h1>
          </div>
          <Link
            href="/super-admin/new"
            className="px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65]"
          >
            + Neuer Tenant
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {!tenants?.length ? (
            <p className="p-6 text-sm text-gray-400">Keine Tenants vorhanden.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hostname</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stadt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(tenants as TenantConfig[]).map((t) => (
                  <tr key={t.tenant} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{t.tenant}</td>
                    <td className="px-4 py-3 text-gray-600">{t.hostname}</td>
                    <td className="px-4 py-3 text-gray-600">{t.city}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/super-admin/${t.tenant}`}
                        className="text-[#BCA075] hover:underline text-xs font-medium"
                      >
                        Bearbeiten
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
