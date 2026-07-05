'use client';

import { useState } from 'react';
import { visibleGroups, type AnmeldungenView, type AnmeldungGroup } from '@/lib/anmeldungen-groups';
import { formatVeranstaltungDate } from '@/lib/format';

const groupKey = (g: AnmeldungGroup) => `${g.eventId}|${g.title}|${g.date}`;

export default function AnmeldungenTab({
  view,
  lockedEventId,
}: {
  view: AnmeldungenView;
  lockedEventId?: string;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const groups = visibleGroups(view, lockedEventId);

  if (groups.length === 0) {
    return (
      <p className="p-6 text-gray-400 text-sm">
        {lockedEventId ? 'Veranstaltung nicht gefunden.' : 'Keine kommenden Veranstaltungen.'}
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {groups.map(group => {
        const key = groupKey(group);
        return (
          <EventGroup
            key={key}
            group={group}
            expanded={!collapsed.has(key)}
            onToggle={() => toggle(key)}
          />
        );
      })}
    </div>
  );
}

function EventGroup({
  group,
  expanded,
  onToggle,
}: {
  group: AnmeldungGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-800">{group.title}</span>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {formatVeranstaltungDate(group.date)}{group.time ? ` · ${group.time} Uhr` : ''}
        </span>
        <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
          {group.registrations.length} {group.registrations.length === 1 ? 'Anmeldung' : 'Anmeldungen'} {expanded ? '▲' : '▼'}
        </span>
      </button>
      {expanded && (
        group.registrations.length === 0 ? (
          <p className="px-6 pb-4 text-gray-400 text-sm">Noch keine Anmeldungen.</p>
        ) : (
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Angemeldet am</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">E-Mail</th>
                  <th className="px-6 py-3">Telefon</th>
                  <th className="px-6 py-3">TM-Lehrer</th>
                  <th className="px-6 py-3">Erlernt am</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {group.registrations.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-xs">{r.timestamp}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{r.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <a href={`mailto:${r.email}`} className="hover:text-[#BCA075]">{r.email}</a>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.tmLehrer || '—'}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.datumErlernen || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
