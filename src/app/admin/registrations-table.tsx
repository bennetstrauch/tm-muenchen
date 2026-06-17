'use client';

import { useState } from 'react';
import type { Registration } from '@/lib/sheets';

export default function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
  const eventDates = Array.from(new Set(registrations.map(r => r.eventDate).filter(Boolean))).sort();
  const [filter, setFilter] = useState('');

  const filtered = filter ? registrations.filter(r => r.eventDate === filter) : registrations;

  return (
    <>
      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Event</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white"
        >
          <option value="">Alle ({registrations.length})</option>
          {eventDates.map(date => (
            <option key={date} value={date}>
              {date} ({registrations.filter(r => r.eventDate === date).length})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="p-6 text-gray-400 text-sm">Keine Anmeldungen für dieses Event.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">Angemeldet am</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">E-Mail</th>
                <th className="px-6 py-3">Telefon</th>
                <th className="px-6 py-3">Stadt</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Typ</th>
                <th className="px-6 py-3">NL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-xs">{r.timestamp}</td>
                  <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{r.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a href={`mailto:${r.email}`} className="hover:text-[#BCA075]">{r.email}</a>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.phone || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.city || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {r.eventDate}{r.eventTime ? ` · ${r.eventTime} Uhr` : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.eventType === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {r.eventType || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.newsSubscribed ? '✓' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
