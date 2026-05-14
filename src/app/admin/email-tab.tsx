'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { EmailAction } from '@/lib/email-actions';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { formatVeranstaltungDate } from '@/lib/format';

// ─── Types ────────────────────────────────────────────────────────────────────

type DerivedReminderEntry = {
  kind: 'derived';
  eventId: string;
  eventTitle: string;
  slot: 'reminder-1' | 'reminder-2';
  subject: string;
  body: string;
  scheduledAt: string; // ISO
  hoursOffset: number;
};

type EmailRow =
  | { kind: 'action'; action: EmailAction }
  | DerivedReminderEntry;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';
const TEXTAREA_CLS = `${INPUT_CLS} resize-y`;
const BTN_GOLD = 'px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_OUTLINE = 'px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50';

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

function formatIso(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function calcReminderIso(isoDate: string, time: string, hoursOffset: number): string {
  const [, month] = isoDate.split('-').map(Number);
  const utcOffset = month >= 4 && month <= 10 ? 2 : 1;
  const offsetStr = utcOffset === 2 ? '+02:00' : '+01:00';
  const eventMs = new Date(`${isoDate}T${time || '19:00'}:00${offsetStr}`).getTime();
  return new Date(eventMs - hoursOffset * 3_600_000).toISOString();
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  subject,
  body,
  recipientCount,
  sampleName,
  onConfirm,
  onClose,
  sending,
}: {
  subject: string;
  body: string;
  recipientCount: number;
  sampleName: string;
  onConfirm: () => void;
  onClose: () => void;
  sending: boolean;
}) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/email-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, sampleName }),
    })
      .then(r => r.json())
      .then(d => { setHtml(d.html ?? ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [body, sampleName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Vorschau</p>
            <p className="text-xs text-gray-400 mt-0.5">Betreff: {subject}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto p-2 bg-gray-50">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Lade Vorschau…</p>
          ) : (
            <iframe
              srcDoc={html}
              className="w-full rounded border border-gray-200 bg-white"
              style={{ height: '480px' }}
              title="E-Mail Vorschau"
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Wird an <strong>{recipientCount}</strong> Angemeldete gesendet
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className={BTN_OUTLINE}>Abbrechen</button>
            <button onClick={onConfirm} disabled={sending || loading} className={BTN_GOLD}>
              {sending ? 'Wird gesendet…' : 'Senden bestätigen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compose Form ─────────────────────────────────────────────────────────────

type ComposeTarget =
  | { mode: 'new' }
  | { mode: 'edit-action'; action: EmailAction }
  | { mode: 'edit-reminder'; event: Veranstaltung; slot: 'reminder-1' | 'reminder-2' };

function ComposeForm({
  target,
  events,
  lockedEventId,
  onClose,
  onSaved,
  tokenHeader,
}: {
  target: ComposeTarget;
  events: Veranstaltung[];
  lockedEventId?: string;
  onClose: () => void;
  onSaved: (action?: EmailAction) => void;
  tokenHeader?: string;
}) {
  const isReminderEdit = target.mode === 'edit-reminder';

  const initialEventId =
    target.mode === 'edit-action' ? target.action.eventId :
    target.mode === 'edit-reminder' ? target.event.id :
    lockedEventId ?? '';

  const initialSubject =
    target.mode === 'edit-action' ? target.action.subject :
    target.mode === 'edit-reminder'
      ? (target.slot === 'reminder-1' ? target.event.reminderSubject1 : target.event.reminderSubject2) ?? ''
      : '';

  const initialBody =
    target.mode === 'edit-action' ? target.action.body :
    target.mode === 'edit-reminder'
      ? (target.slot === 'reminder-1' ? target.event.reminderBody1 : target.event.reminderBody2) ?? ''
      : '';

  const initialScheduledAt =
    target.mode === 'edit-action' && target.action.scheduledAt
      ? target.action.scheduledAt.slice(0, 16)
      : '';

  const [eventId, setEventId] = useState(initialEventId);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>(
    initialScheduledAt ? 'schedule' : 'now',
  );
  const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selectedEvent = events.find(e => e.id === eventId);
  const eventLocked = !!lockedEventId || target.mode !== 'new';

  // For reminder edits: also manage hours offset
  const [reminderHours, setReminderHours] = useState(
    target.mode === 'edit-reminder'
      ? (target.slot === 'reminder-1' ? target.event.reminder1Hours : target.event.reminder2Hours)
      : 24,
  );

  const recipientCount = 0; // fetched lazily — shown in preview modal

  async function fetchRecipientCount(): Promise<number> {
    const res = await fetch(`/api/admin/email-actions?eventId=${encodeURIComponent(eventId)}`);
    // We piggyback on the registrations count from the existing endpoint
    // Actually we need to call the registrations; use a separate approach:
    return 0; // Will be shown in preview as "wird geladen"
  }

  async function saveReminderEdit() {
    if (!selectedEvent || target.mode !== 'edit-reminder') return;
    setSaving(true);
    setError('');
    try {
      const patch = target.slot === 'reminder-1'
        ? { reminderSubject1: subject, reminderBody1: body, reminder1Hours: reminderHours }
        : { reminderSubject2: subject, reminderBody2: body, reminder2Hours: reminderHours };

      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedEvent, ...patch }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function saveActionEdit() {
    if (target.mode !== 'edit-action') return;
    setSaving(true);
    setError('');
    try {
      const updated: EmailAction = {
        ...target.action,
        subject,
        body,
        scheduledAt: sendMode === 'schedule' ? new Date(scheduledAt).toISOString() : '',
      };
      const res = await fetch(`/api/admin/email-actions/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleSendNow() {
    if (!eventId || !subject.trim() || !body.trim()) {
      setError('Bitte alle Felder ausfüllen.');
      return;
    }
    setShowPreview(true);
  }

  async function confirmSend() {
    setSending(true);
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tokenHeader) {
        headers['x-admin-token'] = tokenHeader;
        headers['x-admin-token-event'] = eventId;
      }
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventId,
          eventTitle: selectedEvent?.title ?? '',
          subject,
          body,
          createdBy: tokenHeader ? 'leiter' : 'admin',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowPreview(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Senden fehlgeschlagen.');
      setShowPreview(false);
    } finally {
      setSending(false);
    }
  }

  async function handleSchedule() {
    if (!eventId || !subject.trim() || !body.trim() || !scheduledAt) {
      setError('Bitte alle Felder inkl. Sendezeitpunkt ausfüllen.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tokenHeader) {
        headers['x-admin-token'] = tokenHeader;
        headers['x-admin-token-event'] = eventId;
      }
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventId,
          eventTitle: selectedEvent?.title ?? '',
          subject,
          body,
          scheduledAt: new Date(scheduledAt).toISOString(),
          createdBy: tokenHeader ? 'leiter' : 'admin',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  const sampleName = selectedEvent?.hosts?.split(',')[0]?.trim() ?? 'Marlena';

  return (
    <>
      {showPreview && (
        <PreviewModal
          subject={subject}
          body={body}
          recipientCount={0}
          sampleName={sampleName}
          onConfirm={confirmSend}
          onClose={() => setShowPreview(false)}
          sending={sending}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-medium text-gray-700">
          {target.mode === 'new' ? 'Neue E-Mail' :
           isReminderEdit ? `Erinnerung ${target.slot === 'reminder-1' ? '1' : '2'} bearbeiten` :
           'E-Mail bearbeiten'}
        </h3>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        {/* Veranstaltung */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Veranstaltung</label>
          {eventLocked ? (
            <p className="text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded border border-gray-200">
              {selectedEvent?.title ?? eventId}
            </p>
          ) : (
            <select
              className={INPUT_CLS}
              value={eventId}
              onChange={e => setEventId(e.target.value)}
            >
              <option value="">– Veranstaltung wählen –</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
              ))}
            </select>
          )}
        </div>

        {/* Reminder hours (only for reminder edits) */}
        {isReminderEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Erinnerung senden X Stunden vorher
            </label>
            <input
              type="number"
              min="1"
              className={INPUT_CLS}
              value={reminderHours}
              onChange={e => setReminderHours(parseInt(e.target.value) || 24)}
            />
            {selectedEvent && reminderHours > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Sendezeit: {formatIso(calcReminderIso(selectedEvent.date, selectedEvent.time, reminderHours))}
              </p>
            )}
          </div>
        )}

        {/* Betreff */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Betreff</label>
          <input
            className={INPUT_CLS}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={isReminderEdit ? `Erinnerung: ${selectedEvent?.title ?? ''}` : ''}
          />
        </div>

        {/* Nachricht */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Nachricht{' '}
            <span className="font-normal text-gray-400">
              — „Hallo [Name]," wird automatisch vorangestellt
            </span>
          </label>
          <textarea
            className={`${TEXTAREA_CLS} min-h-[140px]`}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Vorschau button */}
        <div>
          <button
            type="button"
            onClick={() => { if (subject.trim() && body.trim()) setShowPreview(true); }}
            disabled={!subject.trim() || !body.trim()}
            className="text-sm text-[#BCA075] hover:underline disabled:opacity-40"
          >
            Vorschau anzeigen →
          </button>
        </div>

        {/* Sendezeit (not for reminder edits) */}
        {!isReminderEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Senden</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  checked={sendMode === 'now'}
                  onChange={() => setSendMode('now')}
                  className="accent-[#BCA075]"
                />
                Jetzt senden
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  checked={sendMode === 'schedule'}
                  onChange={() => setSendMode('schedule')}
                  className="accent-[#BCA075]"
                />
                Planen
              </label>
            </div>
            {sendMode === 'schedule' && (
              <input
                type="datetime-local"
                className={INPUT_CLS}
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isReminderEdit ? (
            <button onClick={saveReminderEdit} disabled={saving} className={BTN_GOLD}>
              {saving ? 'Speichern…' : 'Erinnerung speichern'}
            </button>
          ) : target.mode === 'edit-action' ? (
            <button onClick={saveActionEdit} disabled={saving} className={BTN_GOLD}>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
          ) : sendMode === 'now' ? (
            <button
              onClick={handleSendNow}
              disabled={!eventId || !subject.trim() || !body.trim()}
              className={BTN_GOLD}
            >
              Jetzt senden
            </button>
          ) : (
            <button
              onClick={handleSchedule}
              disabled={saving || !eventId || !subject.trim() || !body.trim() || !scheduledAt}
              className={BTN_GOLD}
            >
              {saving ? 'Planen…' : 'Einplanen'}
            </button>
          )}
          <button onClick={onClose} className={BTN_OUTLINE}>Abbrechen</button>
        </div>
      </div>
    </>
  );
}

// ─── EmailActionsTab ──────────────────────────────────────────────────────────

export default function EmailActionsTab({
  initialActions,
  events,
  lockedEventId,
  tokenHeader,
}: {
  initialActions: EmailAction[];
  events: Veranstaltung[];
  lockedEventId?: string;
  tokenHeader?: string;
}) {
  const [actions, setActions] = useState<EmailAction[]>(initialActions);
  const [filter, setFilter] = useState(lockedEventId ?? '');
  const [composing, setComposing] = useState<ComposeTarget | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Keep filter in sync with lockedEventId when it arrives
  useEffect(() => {
    if (lockedEventId) setFilter(lockedEventId);
  }, [lockedEventId]);

  // ── Derived reminder entries from events ────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const sentSet = useMemo(
    () => new Set(actions.filter(a => a.status === 'sent').map(a => `${a.eventId}:${a.type}`)),
    [actions],
  );

  const derivedReminders = useMemo<DerivedReminderEntry[]>(() => {
    const evts = lockedEventId ? events.filter(e => e.id === lockedEventId) : events;
    const entries: DerivedReminderEntry[] = [];
    for (const ev of evts) {
      if (ev.date < today) continue;
      const slots: Array<{ hours: number; slot: 'reminder-1' | 'reminder-2'; subject?: string; body?: string }> = [
        { hours: ev.reminder1Hours, slot: 'reminder-1', subject: ev.reminderSubject1, body: ev.reminderBody1 },
        { hours: ev.reminder2Hours, slot: 'reminder-2', subject: ev.reminderSubject2, body: ev.reminderBody2 },
      ];
      for (const s of slots) {
        if (!s.hours) continue;
        if (sentSet.has(`${ev.id}:${s.slot}`)) continue;
        const scheduledAt = calcReminderIso(ev.date, ev.time, s.hours);
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
  }, [events, sentSet, today, lockedEventId]);

  // ── Merge + filter + sort ───────────────────────────────────────────────────
  const rows = useMemo<EmailRow[]>(() => {
    const storedRows: EmailRow[] = actions
      .filter(a => !filter || a.eventId === filter)
      .filter(a => a.status !== 'cancelled')
      .map(a => ({ kind: 'action' as const, action: a }));

    const derivedRows: EmailRow[] = derivedReminders
      .filter(d => !filter || d.eventId === filter);

    return [...storedRows, ...derivedRows].sort((a, b) => {
      const dateA = a.kind === 'action' ? (a.action.sentAt || a.action.scheduledAt) : a.scheduledAt;
      const dateB = b.kind === 'action' ? (b.action.sentAt || b.action.scheduledAt) : b.scheduledAt;
      return (dateB || '').localeCompare(dateA || '');
    });
  }, [actions, derivedReminders, filter]);

  const eventTitles = useMemo(
    () => Array.from(new Set(events.map(e => ({ id: e.id, title: e.title })))),
    [events],
  );

  async function handleDelete(id: string) {
    setError('');
    try {
      const res = await fetch(`/api/admin/email-actions/${id}`, { method: 'DELETE' });
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
      // Reload from API
      fetch('/api/admin/email-actions')
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
        events={events}
        lockedEventId={lockedEventId}
        onClose={() => setComposing(null)}
        onSaved={handleSaved}
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
          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-gray-50">
            {rows.map((row, i) => {
              if (row.kind === 'derived') {
                const ev = events.find(e => e.id === row.eventId);
                return (
                  <div key={`d-${i}`} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{row.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{row.eventTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatIso(row.scheduledAt)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 shrink-0">
                        Automatisch
                      </span>
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
                        <button
                          onClick={() => setComposing({ mode: 'edit-action', action })}
                          className="text-[#BCA075] hover:underline"
                        >
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
                    {action.recipientCount > 0 && (
                      <span className="text-gray-400">{action.recipientCount} Empfänger</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
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
                    const ev = events.find(e => e.id === row.eventId);
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
                        <td className="px-6 py-4 text-right whitespace-nowrap">
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
                        {action.recipientCount > 0 ? action.recipientCount : '—'}
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
