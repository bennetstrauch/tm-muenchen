'use client';

import { useState } from 'react';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { buildRescheduleMessage } from '@/lib/reschedule-message';
import ComposeForm from './email-compose-form';

const BTN_GOLD = 'px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_OUTLINE = 'px-4 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50';

type Recipient = { name: string; email: string };

// Shown after a Verschiebung is committed. Lets the admin tell registrants:
// Manuell (recommended) — copy the addresses + a suggested subject and mail
// them from their own client — or Automatisch — send via the compose form.
export default function RescheduleNotifyPanel({
  event,
  oldDate,
  oldTime,
  recipients,
  events,
  onClose,
}: {
  event: Veranstaltung;
  oldDate: string;
  oldTime: string;
  recipients: Recipient[];
  events: Veranstaltung[];
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<'manuell' | 'automatisch'>('manuell');
  const [copied, setCopied] = useState<'emails' | 'subject' | null>(null);

  const { subject, body } = buildRescheduleMessage({
    title: event.title,
    oldDate,
    oldTime,
    newDate: event.date,
    newTime: event.time,
  });

  function copy(text: string, what: 'emails' | 'subject') {
    navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Angemeldete informieren</p>
            <p className="text-xs text-gray-400 mt-0.5">{recipients.length} Anmeldung{recipients.length === 1 ? '' : 'en'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="flex gap-4">
            {(['manuell', 'automatisch'] as const).map(c => (
              <label key={c} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" checked={choice === c} onChange={() => setChoice(c)} className="accent-[#BCA075]" />
                {c === 'manuell' ? 'Selbst schreiben (empfohlen)' : 'Automatisch senden'}
              </label>
            ))}
          </div>

          {choice === 'manuell' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vorgeschlagener Betreff</label>
                <div className="flex gap-2">
                  <p className="flex-1 text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded border border-gray-200">{subject}</p>
                  <button onClick={() => copy(subject, 'subject')} className={BTN_OUTLINE}>
                    {copied === 'subject' ? 'Kopiert ✓' : 'Kopieren'}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-500">Empfänger</label>
                  <button onClick={() => copy(recipients.map(r => r.email).join(', '), 'emails')} className={BTN_GOLD}>
                    {copied === 'emails' ? 'Kopiert ✓' : 'Alle E-Mails kopieren'}
                  </button>
                </div>
                <ul className="text-sm text-gray-700 border border-gray-200 rounded divide-y divide-gray-100 max-h-60 overflow-auto">
                  {recipients.map(r => (
                    <li key={r.email} className="px-3 py-2 flex justify-between gap-4">
                      <span>{r.name || '—'}</span>
                      <span className="text-gray-500">{r.email}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button onClick={onClose} className={BTN_OUTLINE}>Fertig</button>
              </div>
            </div>
          ) : (
            <ComposeForm
              target={{ mode: 'prefill', eventId: event.id, subject, body }}
              events={events}
              onClose={onClose}
              onSaved={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
