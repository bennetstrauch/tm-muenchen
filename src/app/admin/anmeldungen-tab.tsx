'use client';

import { useState } from 'react';
import { visibleGroups, sortRegistrations, type AnmeldungenView, type AnmeldungGroup, type AnmeldungenSort } from '@/lib/anmeldungen-groups';
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
  const [expandedPast, setExpandedPast] = useState<Set<string>>(new Set());
  const [showPast, setShowPast] = useState(false);
  const [sort, setSort] = useState<AnmeldungenSort>({ key: 'timestamp', dir: 'desc' });

  function clickSort(key: AnmeldungenSort['key']) {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'name' ? 'asc' : 'desc' });
  }

  function toggleIn(set: Set<string>, key: string): Set<string> {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }

  const groups = visibleGroups(view, lockedEventId);

  if (lockedEventId && groups.length === 0) {
    return <p className="p-6 text-gray-400 text-sm">Veranstaltung nicht gefunden.</p>;
  }

  return (
    <>
      {groups.length === 0 ? (
        <p className="p-6 text-gray-400 text-sm">
          Keine kommenden Veranstaltungen.{!lockedEventId && view.past.length > 0 ? ' Vergangene Veranstaltungen siehe unten.' : ''}
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {groups.map(group => {
            const key = groupKey(group);
            return (
              <EventGroup
                key={key}
                group={group}
                expanded={!collapsed.has(key)}
                onToggle={() => setCollapsed(prev => toggleIn(prev, key))}
                sort={sort}
                onSort={clickSort}
              />
            );
          })}
        </div>
      )}

      {!lockedEventId && view.past.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowPast(p => !p)}
            className="px-6 py-3 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            Vergangene Veranstaltungen ({view.past.length}) {showPast ? '▲' : '▼'}
          </button>
          {showPast && (
            <div className="divide-y divide-gray-100 opacity-60">
              {view.past.map(group => {
                const key = groupKey(group);
                return (
                  <EventGroup
                    key={key}
                    group={group}
                    expanded={expandedPast.has(key)}
                    onToggle={() => setExpandedPast(prev => toggleIn(prev, key))}
                    sort={sort}
                    onSort={clickSort}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {!lockedEventId && view.reihen.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-4">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Gesamtübersicht</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {view.reihen.map((r, i) => (
              <li key={i}>
                <span className="font-medium text-gray-800">{r.label}</span>
                {' — '}{r.anmeldungen} {r.anmeldungen === 1 ? 'Anmeldung' : 'Anmeldungen'} über {r.termine} {r.termine === 1 ? 'Termin' : 'Termine'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function EventGroup({
  group,
  expanded,
  onToggle,
  sort,
  onSort,
}: {
  group: AnmeldungGroup;
  expanded: boolean;
  onToggle: () => void;
  sort: AnmeldungenSort;
  onSort: (key: AnmeldungenSort['key']) => void;
}) {
  const sortArrow = (key: AnmeldungenSort['key']) =>
    sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-800">
          {group.title}{group.deleted ? ' (gelöscht)' : ''}
        </span>
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
                  <th className="px-6 py-3">
                    <button onClick={() => onSort('timestamp')} className="uppercase tracking-wider hover:text-gray-600">
                      Angemeldet am{sortArrow('timestamp')}
                    </button>
                  </th>
                  <th className="px-6 py-3">
                    <button onClick={() => onSort('name')} className="uppercase tracking-wider hover:text-gray-600">
                      Name{sortArrow('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3">E-Mail</th>
                  <th className="px-6 py-3">Telefon</th>
                  <th className="px-6 py-3">TM-Lehrer</th>
                  <th className="px-6 py-3">Erlernt am</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortRegistrations(group.registrations, sort).map((r, i) => (
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
