'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EmailAction } from '@/lib/email-actions';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { formatVeranstaltungDate } from '@/lib/format';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComposeTarget =
  | { mode: 'new' }
  | { mode: 'edit-action'; action: EmailAction }
  | { mode: 'edit-reminder'; event: Veranstaltung; slot: 'reminder-1' | 'reminder-2' };

// ─── Constants ────────────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';
const TEXTAREA_CLS = `${INPUT_CLS} resize-y`;
const BTN_GOLD = 'px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_OUTLINE = 'px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatIso(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function calcReminderIso(isoDate: string, time: string, hoursOffset: number): string {
  const [, month] = isoDate.split('-').map(Number);
  const utcOffset = month >= 4 && month <= 10 ? 2 : 1;
  const offsetStr = utcOffset === 2 ? '+02:00' : '+01:00';
  const eventMs = new Date(`${isoDate}T${time || '19:00'}:00${offsetStr}`).getTime();
  if (isNaN(eventMs)) return '';
  return new Date(eventMs - hoursOffset * 3_600_000).toISOString();
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  subject,
  body,
  sampleName,
  onConfirm,
  onClose,
  sending,
  tokenHeaders,
}: {
  subject: string;
  body: string;
  sampleName: string;
  onConfirm: () => void;
  onClose: () => void;
  sending: boolean;
  tokenHeaders: Record<string, string>;
}) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/email-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...tokenHeaders },
      body: JSON.stringify({ body, sampleName }),
    })
      .then(r => r.json())
      .then(d => { setHtml(d.html ?? ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [body, sampleName, tokenHeaders]);

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

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className={BTN_OUTLINE}>Abbrechen</button>
          <button onClick={onConfirm} disabled={sending || loading} className={BTN_GOLD}>
            {sending ? 'Wird gesendet…' : 'Senden bestätigen'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Compose Form ─────────────────────────────────────────────────────────────

export default function ComposeForm({
  target,
  events,
  lockedEventId,
  onClose,
  onSaved,
  onEventUpdated,
  tokenHeader,
}: {
  target: ComposeTarget;
  events: Veranstaltung[];
  lockedEventId?: string;
  onClose: () => void;
  onSaved: (action?: EmailAction) => void;
  onEventUpdated?: (event: Veranstaltung) => void;
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
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>(initialScheduledAt ? 'schedule' : 'now');
  const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);
  const [reminderHours, setReminderHours] = useState(
    target.mode === 'edit-reminder'
      ? (target.slot === 'reminder-1' ? target.event.reminder1Hours : target.event.reminder2Hours)
      : 24,
  );
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selectedEvent = events.find(e => e.id === eventId);
  const eventLocked = !!lockedEventId || target.mode !== 'new';
  const sampleName = selectedEvent?.hosts?.split(',')[0]?.trim() ?? 'Marlena';

  // In magic-link (Leiter) mode every admin API call must carry the scoped token
  // so the proxy gate lets it through.
  const tokenHeaders = useMemo<Record<string, string>>(() => {
    const h: Record<string, string> = {};
    if (tokenHeader) {
      h['x-admin-token'] = tokenHeader;
      h['x-admin-token-event'] = eventId;
    }
    return h;
  }, [tokenHeader, eventId]);

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
        headers: { 'Content-Type': 'application/json', ...tokenHeaders },
        body: JSON.stringify({ ...selectedEvent, ...patch }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onEventUpdated?.({ ...selectedEvent, ...patch });
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
        headers: { 'Content-Type': 'application/json', ...tokenHeaders },
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
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tokenHeaders },
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
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tokenHeaders },
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

  return (
    <>
      {showPreview && (
        <PreviewModal
          subject={subject}
          body={body}
          sampleName={sampleName}
          onConfirm={confirmSend}
          onClose={() => setShowPreview(false)}
          sending={sending}
          tokenHeaders={tokenHeaders}
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

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Veranstaltung</label>
          {eventLocked ? (
            <p className="text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded border border-gray-200">
              {selectedEvent?.title ?? eventId}
            </p>
          ) : (
            <select className={INPUT_CLS} value={eventId} onChange={e => setEventId(e.target.value)}>
              <option value="">– Veranstaltung wählen –</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
              ))}
            </select>
          )}
        </div>

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
              onFocus={e => e.target.select()}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) setReminderHours(v);
              }}
            />
            {selectedEvent && reminderHours > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Sendezeit: {formatIso(calcReminderIso(selectedEvent.date, selectedEvent.time, reminderHours))}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Betreff</label>
          <input
            className={INPUT_CLS}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={isReminderEdit ? `Erinnerung: ${selectedEvent?.title ?? ''}` : ''}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Nachricht{' '}
            <span className="font-normal text-gray-400">— „Hallo [Name]," wird automatisch vorangestellt</span>
          </label>
          <textarea
            className={`${TEXTAREA_CLS} min-h-[140px]`}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

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

        {!isReminderEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Senden</label>
            <div className="flex gap-4 mb-2">
              {(['now', 'schedule'] as const).map(mode => (
                <label key={mode} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={sendMode === mode}
                    onChange={() => setSendMode(mode)}
                    className="accent-[#BCA075]"
                  />
                  {mode === 'now' ? 'Jetzt senden' : 'Planen'}
                </label>
              ))}
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
