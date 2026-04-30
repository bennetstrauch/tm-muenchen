'use client';

import { useState, useMemo } from 'react';
import type { Veranstaltung, EventRegistrationRecord } from '@/lib/veranstaltungen';

type Mode =
  | { view: 'list' }
  | { view: 'new' }
  | { view: 'edit'; event: Veranstaltung };

const EMPTY_FORM: Omit<Veranstaltung, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  longDescription: '',
  date: '',
  time: '',
  location: '',
  isOnline: false,
  onlineLink: '',
  hosts: '',
  price: '',
  targetAudience: '',
  notes: '',
  reminder1Hours: 24,
  reminder2Hours: 0,
  registrationOpen: true,
  visible: true,
  isPriority: false,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';
const TEXTAREA_CLS = `${INPUT_CLS} resize-y min-h-[70px]`;
const CHECK_CLS = 'h-4 w-4 accent-[#BCA075]';

function EventForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: Omit<Veranstaltung, 'id'>;
  onSave: (v: Omit<Veranstaltung, 'id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Omit<Veranstaltung, 'id'>>(initial);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Titel *">
          <input className={INPUT_CLS} value={form.title} onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Untertitel">
          <input className={INPUT_CLS} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
        </Field>
        <Field label="Datum * (YYYY-MM-DD)">
          <input type="date" className={INPUT_CLS} value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Uhrzeit * (HH:MM)">
          <input type="time" className={INPUT_CLS} value={form.time} onChange={e => set('time', e.target.value)} />
        </Field>
        <Field label="Ort">
          <input className={INPUT_CLS} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Guldeinstraße 47" />
        </Field>
        <Field label="Leiter">
          <input className={INPUT_CLS} value={form.hosts} onChange={e => set('hosts', e.target.value)} placeholder="Bennet, Malena" />
        </Field>
        <Field label="Preis (optional)">
          <input className={INPUT_CLS} value={form.price} onChange={e => set('price', e.target.value)} placeholder="65 €/P.; 50 € Ehepaare" />
        </Field>
        <Field label="Zielgruppe (optional)">
          <input className={INPUT_CLS} value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)} placeholder="15–45 Jahre" />
        </Field>
        <Field label="Erinnerung 1 (Stunden vorher)">
          <input type="number" min="0" className={INPUT_CLS} value={form.reminder1Hours} onChange={e => set('reminder1Hours', parseInt(e.target.value) || 24)} />
        </Field>
        <Field label="Erinnerung 2 (Stunden vorher, 0 = keine)">
          <input type="number" min="0" className={INPUT_CLS} value={form.reminder2Hours} onChange={e => set('reminder2Hours', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Online-Link (optional)">
          <input className={INPUT_CLS} value={form.onlineLink} onChange={e => set('onlineLink', e.target.value)} placeholder="https://zoom.us/..." />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Kurzbeschreibung">
          <textarea className={TEXTAREA_CLS} value={form.description} onChange={e => set('description', e.target.value)} placeholder="mit Gruppenmeditation, Maharishi-Tape…" />
        </Field>
        <Field label="Hinweise (optional)">
          <textarea className={TEXTAREA_CLS} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Weitere Infos folgen" />
        </Field>
        <Field label="Ausführliche Beschreibung (optional)">
          <textarea className={TEXTAREA_CLS} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.isOnline} onChange={e => set('isOnline', e.target.checked)} />
          Online
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.registrationOpen} onChange={e => set('registrationOpen', e.target.checked)} />
          Anmeldung offen
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.visible} onChange={e => set('visible', e.target.checked)} />
          Sichtbar auf Website
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.isPriority} onChange={e => set('isPriority', e.target.checked)} />
          Priorität (oben anzeigen)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.title || !form.date}
          className="px-5 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Speichern…' : 'Speichern'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

function RegistrationsTable({ registrations }: { registrations: EventRegistrationRecord[] }) {
  const eventTitles = Array.from(new Set(registrations.map(r => r.eventTitle).filter(Boolean))).sort();
  const [filter, setFilter] = useState('');
  const filtered = filter ? registrations.filter(r => r.eventTitle === filter) : registrations;

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
          {eventTitles.map(t => (
            <option key={t} value={t}>
              {t} ({registrations.filter(r => r.eventTitle === t).length})
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="p-6 text-gray-400 text-sm">Keine Anmeldungen.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">Angemeldet am</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">E-Mail</th>
                <th className="px-6 py-3">Telefon</th>
                <th className="px-6 py-3">Veranstaltung</th>
                <th className="px-6 py-3">Datum</th>
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
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.eventTitle}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.eventDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function EventsClient({
  initialEvents,
  registrations,
}: {
  initialEvents: Veranstaltung[];
  registrations: EventRegistrationRecord[];
}) {
  const [tab, setTab] = useState<'events' | 'registrations'>('events');
  const [events, setEvents] = useState<Veranstaltung[]>(initialEvents);
  const [mode, setMode] = useState<Mode>({ view: 'list' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => {
      if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
      return a.date.localeCompare(b.date);
    }),
    [events]
  );

  async function handleCreate(form: Omit<Veranstaltung, 'id'>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const created: Veranstaltung = await res.json();
      setEvents(prev => [...prev, created]);
      setMode({ view: 'list' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(form: Omit<Veranstaltung, 'id'>) {
    if (mode.view !== 'edit') return;
    const id = mode.event.id;
    setSaving(true);
    setError('');
    try {
      const updated = { ...form, id };
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      setMode({ view: 'list' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen');
    } finally {
      setConfirmDelete(null);
    }
  }

  const TAB_CLS = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-[#BCA075] text-[#BCA075]'
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`;

  return (
    <>
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        <button className={TAB_CLS(tab === 'events')} onClick={() => setTab('events')}>
          Veranstaltungen ({events.length})
        </button>
        <button className={TAB_CLS(tab === 'registrations')} onClick={() => setTab('registrations')}>
          Anmeldungen ({registrations.length})
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded">{error}</p>
      )}

      {tab === 'events' && (
        <>
          {mode.view === 'list' && (
            <>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setMode({ view: 'new' })}
                  className="px-4 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65]"
                >
                  + Neue Veranstaltung
                </button>
              </div>

              {sortedEvents.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">
                  Noch keine Veranstaltungen. Erstelle die erste!
                </p>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-3">Titel</th>
                        <th className="px-6 py-3">Datum</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedEvents.map(event => (
                        <tr key={event.id} className={`hover:bg-gray-50 ${!event.visible ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-800">{event.title}</p>
                            {event.subtitle && (
                              <p className="text-xs text-gray-400 mt-0.5">{event.subtitle}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {event.date}{event.time ? ` · ${event.time} Uhr` : ''}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {event.visible
                                ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-600">Sichtbar</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Versteckt</span>
                              }
                              {event.registrationOpen
                                ? <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">Anm. offen</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Anm. geschl.</span>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setMode({ view: 'edit', event })}
                              className="text-xs text-[#BCA075] hover:underline mr-4"
                            >
                              Bearbeiten
                            </button>
                            {confirmDelete === event.id ? (
                              <>
                                <span className="text-xs text-gray-500 mr-2">Sicher?</span>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="text-xs text-red-500 hover:underline mr-2"
                                >
                                  Ja, löschen
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-xs text-gray-400 hover:underline"
                                >
                                  Abbrechen
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(event.id)}
                                className="text-xs text-gray-400 hover:text-red-500"
                              >
                                Löschen
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {mode.view === 'new' && (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Neue Veranstaltung</h2>
              <EventForm
                initial={EMPTY_FORM}
                onSave={handleCreate}
                onCancel={() => setMode({ view: 'list' })}
                isSaving={saving}
              />
            </>
          )}

          {mode.view === 'edit' && (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Veranstaltung bearbeiten</h2>
              <EventForm
                initial={mode.event}
                onSave={handleUpdate}
                onCancel={() => setMode({ view: 'list' })}
                isSaving={saving}
              />
            </>
          )}
        </>
      )}

      {tab === 'registrations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-700">Anmeldungen für Veranstaltungen</h2>
          </div>
          <RegistrationsTable registrations={registrations} />
        </div>
      )}
    </>
  );
}
