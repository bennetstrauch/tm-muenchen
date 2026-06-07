'use client';

import { useState, useMemo, useEffect } from 'react';
import type { EmailAction } from '@/lib/email-actions';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { formatVeranstaltungDate } from '@/lib/format';
import ComposeForm, { ComposeTarget, calcReminderIso, formatIso } from './email-compose-form';

// ─── Types ────────────────────────────────────────────────────────────────────

type DerivedReminderEntry = {
  kind: 'derived';
  eventId: string;
  eventTitle: string;
  slot: 'reminder-1' | 'reminder-2';
  subject: string;
  body: string;
  scheduledAt: string;
  hoursOffset: number;
};

type EmailRow =
  | { kind: 'action'; action: EmailAction }
  | DerivedReminderEntry;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: EmailAction['status']) {
  const map: Record<EmailAction['status'], string> = {
    pending: 'bg-amber-50 text-amber-700',
    sent: 'bg-green-50 text-green-700',
    failed: 'bg-red-50 text-red-600',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  const label: Record<EmailAction['status'], string> = {
    pending: 'Geplant',
    sent: 'Gesendet',
    failed: 'Fehlgeschlagen',
    cancelled: 'Abgebrochen',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

// ─── EmailActionsTab ──────────────────────────────────────────────────────────

export default function EmailActionsTab({
  initialActions,
  events,
  lockedEventId,
  tokenHeader,
  registrationsByEvent = {},
}: {
  initialActions: EmailAction[];
  events: Veranstaltung[];
  lockedEventId?: string;
  tokenHeader?: string;
  registrationsByEvent?: Record<string, number>;
}) {
  const [actions, setActions] = useState<EmailAction[]>(initialActions);
  const [localEvents, setLocalEvents] = useState<Veranstaltung[]>(events);
  const [filter, setFilter] = useState(lockedEventId ?? '');
  const [composing, setComposing] = useState<ComposeTarget | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lockedEventId) setFilter(lockedEventId);
  }, [lockedEventId]);

  const today = new Date().toISOString().slice(0, 10);

  const sentSet = useMemo(
    () => new Set(actions.filter(a => a.status === 'sent').map(a => `${a.eventId}:${a.type}`)),
    [actions],
  );

  const derivedReminders = useMemo<DerivedReminderEntry[]>(() => {
    const evts = lockedEventId ? localEvents.filter(e => e.id === lockedEventId) : localEvents;
    const entries: DerivedReminderEntry[] = [];
    for (const ev of evts) {
      if (ev.date < today) continue;
      const slots = [
        { hours: ev.reminder1Hours, slot: 'reminder-1' as const, subject: ev.reminderSubject1, body: ev.reminderBody1 },
        { hours: ev.reminder2Hours, slot: 'reminder-2' as const, subject: ev.reminderSubject2, body: ev.reminderBody2 },
      ];
      for (const s of slots) {
        if (!s.hours) continue;
        if (sentSet.has(`${ev.id}:${s.slot}`)) continue;
        const scheduledAt = calcReminderIso(ev.date, ev.time, s.hours);
        if (!scheduledAt) continue;
        entries.push({
          kind: 'derived',
          eventId: ev.id,
          eventTitle: ev.title,
          slot: s.slot,
          subject: s.subject ?? `Erinnerung: ${ev.title} – ${formatVeranstaltungDate(ev.date)}`,
          body: s.body ?? '',
          scheduledAt,
          hoursOffset: s.hours,
        });
      }
    }
    return entries;
  }, [localEvents, sentSet, today, lockedEventId]);

  const rows = useMemo<EmailRow[]>(() => {
    const stored: EmailRow[] = actions
      .filter(a => !filter || a.eventId === filter)
      .filter(a => a.status !== 'cancelled')
      .map(a => ({ kind: 'action' as const, action: a }));
    const derived: EmailRow[] = derivedReminders.filter(d => !filter || d.eventId === filter);
    return [...stored, ...derived].sort((a, b) => {
      const dA = a.kind === 'action' ? (a.action.sentAt || a.action.scheduledAt) : a.scheduledAt;
      const dB = b.kind === 'action' ? (b.action.sentAt || b.action.scheduledAt) : b.scheduledAt;
      return (dB || '').localeCompare(dA || '');
    });
  }, [actions, derivedReminders, filter]);

  const eventTitles = useMemo(
    () => Array.from(new Set(localEvents.map(e => ({ id: e.id, title: e.title })))),
    [localEvents],
  );

  const tokenHeaders: Record<string, string> = {};
  if (tokenHeader && lockedEventId) {
    tokenHeaders['x-admin-token'] = tokenHeader;
    tokenHeaders['x-admin-token-event'] = lockedEventId;
  }

  async function handleDelete(id: string) {
    setError('');
    try {
      const res = await fetch(`/api/admin/email-actions/${id}`, { method: 'DELETE', headers: tokenHeaders });
      if (!res.ok) throw new Error((await res.json()).error);
      setActions(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen.');
    } finally {
      setConfirmDelete(null);
    }
  }

  function handleSaved(updated?: EmailAction) {
    if (updated) {
      setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
    } else {
      fetch('/api/admin/email-actions', { headers: tokenHeaders })
        .then(r => r.json())
        .then((data: EmailAction[]) => setActions(data))
        .catch(() => {});
    }
    setComposing(null);
  }

  if (composing) {
    return (
      <ComposeForm
        target={composing}
        events={localEvents}
        lockedEventId={lockedEventId}
        onClose={() => setComposing(null)}
        onSaved={handleSaved}
        onEventUpdated={ev => setLocalEvents(prev => prev.map(e => e.id === ev.id ? ev : e))}
        tokenHeader={tokenHeader}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Event</label>
          <select
            value={filter}
            onChange={e => { if (!lockedEventId) setFilter(e.target.value); }}
            disabled={!!lockedEventId}
            className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="">Alle</option>
            {eventTitles.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setComposing({ mode: 'new' })}
          className="px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65]"
        >
          + Neue E-Mail
        </button>
      </div>

      {error && (
        <p className="mx-6 mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      {rows.length === 0 ? (
        <p className="p-6 text-gray-400 text-sm">Noch keine E-Mails.</p>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-50">
            {rows.map((row, i) => {
              if (row.kind === 'derived') {
                const ev = localEvents.find(e => e.id === row.eventId);
                return (
                  <div key={`d-${i}`} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{row.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{row.eventTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatIso(row.scheduledAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 shrink-0">Automatisch</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => ev && setComposing({ mode: 'edit-reminder', event: ev, slot: row.slot })}
                        className="text-xs text-[#BCA075] hover:underline"
                      >
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                );
              }
              const { action } = row;
              return (
                <div key={action.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{action.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.eventTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatIso(action.sentAt || action.scheduledAt)}</p>
                    </div>
                    {statusBadge(action.status)}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex gap-4 text-xs">
                    {action.status === 'pending' && (
                      <>
                        <button onClick={() => setComposing({ mode: 'edit-action', action })} className="text-[#BCA075] hover:underline">
                          Bearbeiten
                        </button>
                        {confirmDelete === action.id ? (
                          <>
                            <span className="text-gray-500">Sicher?</span>
                            <button onClick={() => handleDelete(action.id)} className="text-red-500 hover:underline">Ja</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:underline">Nein</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(action.id)} className="text-gray-400 hover:text-red-500 ml-auto">
                            Löschen
                          </button>
                        )}
                      </>
                    )}
                    {action.recipientCount > 0 ? (
                      <span className="text-gray-400">{action.recipientCount} Empfänger</span>
                    ) : action.status === 'pending' && registrationsByEvent[action.eventId] > 0 ? (
                      <span className="text-gray-400">~{registrationsByEvent[action.eventId]} Empfänger</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Betreff</th>
                  <th className="px-6 py-3">Veranstaltung</th>
                  <th className="px-6 py-3">Zeitpunkt</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Empf.</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  if (row.kind === 'derived') {
                    const ev = localEvents.find(e => e.id === row.eventId);
                    return (
                      <tr key={`d-${i}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{row.subject}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.eventTitle}</td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{formatIso(row.scheduledAt)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                            Automatisch · {row.hoursOffset}h vorher
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">—</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => ev && setComposing({ mode: 'edit-reminder', event: ev, slot: row.slot })}
                            className="text-xs text-[#BCA075] hover:underline"
                          >
                            Bearbeiten
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  const { action } = row;
                  return (
                    <tr key={action.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{action.subject}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{action.eventTitle}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                        {formatIso(action.sentAt || action.scheduledAt)}
                      </td>
                      <td className="px-6 py-4">{statusBadge(action.status)}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {action.recipientCount > 0
                          ? action.recipientCount
                          : action.status === 'pending' && registrationsByEvent[action.eventId] > 0
                            ? `~${registrationsByEvent[action.eventId]}`
                            : '—'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {action.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setComposing({ mode: 'edit-action', action })}
                              className="text-xs text-[#BCA075] hover:underline mr-4"
                            >
                              Bearbeiten
                            </button>
                            {confirmDelete === action.id ? (
                              <>
                                <span className="text-xs text-gray-500 mr-2">Sicher?</span>
                                <button onClick={() => handleDelete(action.id)} className="text-xs text-red-500 hover:underline mr-2">Ja</button>
                                <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-400 hover:underline">Nein</button>
                              </>
                            ) : (
                              <button onClick={() => setConfirmDelete(action.id)} className="text-xs text-gray-400 hover:text-red-500">
                                Löschen
                              </button>
                            )}
                          </>
                        )}
                        {action.status === 'failed' && action.errorMessage && (
                          <span className="text-xs text-red-400" title={action.errorMessage}>⚠ Fehler</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
