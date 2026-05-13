'use client';

import { useState, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Registration } from '@/lib/sheets';
import type { Veranstaltung, EventRegistrationRecord } from '@/lib/veranstaltungen';
import type { Vorlage } from '@/lib/vorlagen';
import { eventSlug } from '@/lib/format';
import InfoRegistrationsTable from './registrations-table';

type Tab = 'info-anmeldungen' | 'veranstaltungen' | 'anmeldungen' | 'vorlagen';

type Mode =
  | { view: 'list' }
  | { view: 'new' }
  | { view: 'edit'; event: Veranstaltung };

type VorlagePhase =
  | { kind: 'none' }
  | { kind: 'just-saved-new'; id: string }
  | { kind: 'just-updated'; id: string }
  | { kind: 'linked-clean'; id: string }
  | { kind: 'linked-dirty'; id: string }

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
  endTime: '',
  reminder1Hours: 24,
  reminder2Hours: 0,
  registrationOpen: true,
  visible: true,
  isPriority: false,
  imageUrl: '',
  auchFuerNichtMeditierende: false,
  slug: '',
};

const VALID_TABS: Tab[] = ['info-anmeldungen', 'veranstaltungen', 'anmeldungen', 'vorlagen'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── ImagePicker ──────────────────────────────────────────────────────────────

function ImagePicker({
  value,
  onChange,
  events,
}: {
  value: string;
  onChange: (url: string) => void;
  events: Veranstaltung[];
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [library, setLibrary] = useState<string[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function openPanel() {
    setShowPanel(true);
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      setLibrary(data.urls ?? []);
    } finally {
      setLoadingLibrary(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/images/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      setLibrary(prev => [data.url, ...prev]);
      setShowPanel(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleConfirmDelete() {
    if (!deletingUrl) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/images?url=${encodeURIComponent(deletingUrl)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setLibrary(prev => prev.filter(u => u !== deletingUrl));
      if (value === deletingUrl) onChange('');
      setDeletingUrl(null);
    } finally {
      setDeleting(false);
    }
  }

  const affectedByDelete = deletingUrl
    ? events.filter(e => e.imageUrl === deletingUrl).map(e => e.title)
    : null;

  return (
    <div>
      {value ? (
        <div className="flex items-start gap-3">
          <div className="relative w-28 h-18 overflow-hidden rounded border border-gray-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <button type="button" onClick={openPanel}
              className="text-xs text-[#BCA075] hover:underline text-left">
              Bild ändern
            </button>
            <button type="button" onClick={() => onChange('')}
              className="text-xs text-gray-400 hover:text-red-500 text-left">
              Entfernen
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openPanel}
          className="text-sm text-[#BCA075] hover:underline flex items-center gap-1">
          + Bild auswählen
        </button>
      )}

      {showPanel && (
        <div className="mt-2 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">Hochladen</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="text-xs text-gray-600 file:mr-2 file:text-xs file:border-0 file:bg-gray-100 file:px-2 file:py-1 file:rounded file:cursor-pointer"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1">Wird hochgeladen…</p>}
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}

          {loadingLibrary ? (
            <p className="text-xs text-gray-400 mt-3">Bibliothek wird geladen…</p>
          ) : library.length > 0 ? (
            <>
              <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Bibliothek</p>
              <div className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto">
                {library.map(url => (
                  <div key={url} className="relative group">
                    <button type="button"
                      onClick={() => { onChange(url); setShowPanel(false); }}
                      className={`w-full relative overflow-hidden rounded border-2 aspect-square transition-colors ${value === url ? 'border-[#BCA075]' : 'border-transparent hover:border-gray-300'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingUrl(url)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-white/80 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
                      title="Aus Bibliothek löschen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {deletingUrl && (
                <div className="mt-2 text-xs border border-red-100 bg-red-50 rounded p-2">
                  <p className="font-medium text-gray-800">Aus Bibliothek löschen?</p>
                  {affectedByDelete && affectedByDelete.length > 0 && (
                    <p className="mt-0.5 text-amber-700">Verwendet in: {affectedByDelete.join(', ')}</p>
                  )}
                  <div className="flex gap-3 mt-1.5">
                    <button type="button" onClick={handleConfirmDelete} disabled={deleting}
                      className="text-red-500 hover:underline disabled:opacity-50">
                      {deleting ? 'Wird gelöscht…' : 'Ja, löschen'}
                    </button>
                    <button type="button" onClick={() => setDeletingUrl(null)}
                      className="text-gray-400 hover:text-gray-600">
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}

          <button type="button" onClick={() => setShowPanel(false)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600">
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';
const TEXTAREA_CLS = `${INPUT_CLS} resize-y min-h-[70px]`;
const CHECK_CLS = 'h-4 w-4 accent-[#BCA075]';

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function findConflicts(
  date: string,
  time: string,
  allEvents: Veranstaltung[],
  editingId?: string,
): Veranstaltung[] {
  if (!date) return [];
  return allEvents.filter(e => {
    if (e.id === editingId) return false;
    if (e.date !== date) return false;
    if (time && e.time) return Math.abs(timeToMinutes(time) - timeToMinutes(e.time)) < 180;
    return true;
  });
}

// ─── EventFormFields (shared between EventForm and VorlagenTab) ───────────────

function EventFormFields({
  form,
  onChange,
  events,
  showDate,
  titleRequired,
  conflicts,
}: {
  form: Omit<Veranstaltung, 'id'>;
  onChange: <K extends keyof Omit<Veranstaltung, 'id'>>(key: K, value: Omit<Veranstaltung, 'id'>[K]) => void;
  events: Veranstaltung[];
  showDate?: boolean;
  titleRequired?: boolean;
  conflicts?: Veranstaltung[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label={titleRequired ? 'Titel *' : 'Titel'}>
          <input className={INPUT_CLS} value={form.title} onChange={e => onChange('title', e.target.value)} />
        </Field>
        <Field label="Untertitel">
          <input className={INPUT_CLS} value={form.subtitle} onChange={e => onChange('subtitle', e.target.value)} />
        </Field>
        {showDate && (
          <Field label="Datum * (YYYY-MM-DD)">
            <input type="date" className={INPUT_CLS} value={form.date} onChange={e => onChange('date', e.target.value)} />
          </Field>
        )}
        <Field label="Newsletter-Link-Schlüsselwort (optional)">
          <input
            className={INPUT_CLS}
            value={form.slug ?? ''}
            onChange={e => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
        </Field>
      </div>

      {conflicts && conflicts.length > 0 && (
        <div className="mb-4 flex gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <div>
            <p className="font-medium mb-1">
              {conflicts.length === 1 ? 'Ein anderer Termin' : `${conflicts.length} andere Termine`} in diesem Zeitraum:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              {conflicts.map(c => (
                <li key={c.id}>{c.title}{c.time ? ` · ${c.time} Uhr` : ''}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-amber-600 text-xs">Du kannst trotzdem speichern.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Uhrzeit * (HH:MM)">
          <input type="time" className={INPUT_CLS} value={form.time} onChange={e => onChange('time', e.target.value)} />
        </Field>
        <Field label="Ende ca. (optional)">
          <input type="time" className={INPUT_CLS} value={form.endTime ?? ''} onChange={e => onChange('endTime', e.target.value)} />
        </Field>
        <Field label="Ort">
          <input
            className={INPUT_CLS}
            value={form.location}
            onChange={e => onChange('location', e.target.value)}
            list="location-suggestions"
          />
          <datalist id="location-suggestions">
            <option value="Guldeinstr. 47, 80339 München" />
            <option value="Schwabing, Bonner Platz 1, 80803 München" />
          </datalist>
        </Field>
        <Field label="Leiter">
          <input className={INPUT_CLS} value={form.hosts} onChange={e => onChange('hosts', e.target.value)} />
        </Field>
        <Field label="Preis (optional)">
          <input className={INPUT_CLS} value={form.price} onChange={e => onChange('price', e.target.value)} />
        </Field>
        <Field label="Zielgruppe (optional)">
          <input className={INPUT_CLS} value={form.targetAudience} onChange={e => onChange('targetAudience', e.target.value)} />
        </Field>
        <Field label="Erinnerung 1 (Stunden vorher)">
          <input type="number" min="0" className={INPUT_CLS} value={form.reminder1Hours} onChange={e => onChange('reminder1Hours', parseInt(e.target.value) || 24)} />
        </Field>
        <Field label="Erinnerung 2 (Stunden vorher, 0 = keine)">
          <input type="number" min="0" className={INPUT_CLS} value={form.reminder2Hours} onChange={e => onChange('reminder2Hours', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Online-Link (optional)">
          <input className={INPUT_CLS} value={form.onlineLink} onChange={e => onChange('onlineLink', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Kurzbeschreibung">
          <textarea className={TEXTAREA_CLS} value={form.description} onChange={e => onChange('description', e.target.value)} />
        </Field>
        <Field label="Hinweise (optional)">
          <textarea className={TEXTAREA_CLS} value={form.notes} onChange={e => onChange('notes', e.target.value)} />
        </Field>
        <Field label="Ausführliche Beschreibung (optional)">
          <textarea className={TEXTAREA_CLS} value={form.longDescription} onChange={e => onChange('longDescription', e.target.value)} />
        </Field>
      </div>

      <div className="mb-4">
        <Field label="Bild">
          <ImagePicker value={form.imageUrl ?? ''} onChange={url => onChange('imageUrl', url)} events={events} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.isOnline} onChange={e => onChange('isOnline', e.target.checked)} />
          Online
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.registrationOpen} onChange={e => onChange('registrationOpen', e.target.checked)} />
          Anmeldung offen
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.visible} onChange={e => onChange('visible', e.target.checked)} />
          Sichtbar auf Website
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.isPriority} onChange={e => onChange('isPriority', e.target.checked)} />
          Priorität (oben anzeigen)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" className={CHECK_CLS} checked={form.auchFuerNichtMeditierende} onChange={e => onChange('auchFuerNichtMeditierende', e.target.checked)} />
          Auch für Nicht-Meditierende
        </label>
      </div>
    </>
  );
}

// ─── EventForm ───────────────────────────────────────────────────────────────

function EventForm({
  initial,
  onSave,
  onCancel,
  isSaving,
  allEvents,
  editingId,
  vorlagen,
  onSaveAsVorlage,
  onUpdateVorlage,
  onSaveAndUpdateVorlage,
}: {
  initial: Omit<Veranstaltung, 'id'>;
  onSave: (v: Omit<Veranstaltung, 'id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
  allEvents: Veranstaltung[];
  editingId?: string;
  vorlagen: Vorlage[];
  onSaveAsVorlage: (v: Omit<Vorlage, 'id'>) => Promise<Vorlage>;
  onUpdateVorlage: (id: string, data: Omit<Veranstaltung, 'id'>) => Promise<void>;
  onSaveAndUpdateVorlage?: (form: Omit<Veranstaltung, 'id'>, vorlageId: string) => void;
}) {
  const [form, setFormState] = useState<Omit<Veranstaltung, 'id'>>(initial);
  const [vorlagePhase, setVorlagePhase] = useState<VorlagePhase>(() => {
    if (!initial.vorlageId) return { kind: 'none' };
    const linked = vorlagen.find(v => v.id === initial.vorlageId);
    return linked ? { kind: 'linked-clean', id: initial.vorlageId } : { kind: 'none' };
  });
  const [savingVorlage, setSavingVorlage] = useState(false);
  const [showVorlagenPanel, setShowVorlagenPanel] = useState(false);
  const [expandedVorlageId, setExpandedVorlageId] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setFormState(prev => ({ ...prev, [key]: value }));
    setVorlagePhase(prev => {
      if (prev.kind === 'none') return prev;
      if (prev.kind === 'linked-dirty') return prev;
      return { kind: 'linked-dirty', id: prev.id };
    });
  }

  const conflicts = useMemo(
    () => findConflicts(form.date, form.time, allEvents, editingId),
    [form.date, form.time, allEvents, editingId],
  );

  async function handleSaveAsNewVorlage() {
    setSavingVorlage(true);
    try {
      const saved = await onSaveAsVorlage({ ...form, name: form.title || 'Vorlage' });
      setVorlagePhase({ kind: 'just-saved-new', id: saved.id });
      setFormState(prev => ({ ...prev, vorlageId: saved.id }));
    } finally {
      setSavingVorlage(false);
    }
  }

  async function handleUpdateVorlage() {
    if (vorlagePhase.kind !== 'linked-dirty') return;
    const id = vorlagePhase.id;
    setSavingVorlage(true);
    try {
      await onUpdateVorlage(id, form);
      setVorlagePhase({ kind: 'just-updated', id });
    } finally {
      setSavingVorlage(false);
    }
  }

  function handleLoadVorlage(v: Vorlage) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, name, ...data } = v;
    setFormState({ ...data, date: '', vorlageId: id });
    setVorlagePhase({ kind: 'linked-clean', id });
    setShowVorlagenPanel(false);
    setExpandedVorlageId(null);
  }

  const linkedVorlageId =
    vorlagePhase.kind === 'linked-clean' || vorlagePhase.kind === 'linked-dirty'
      ? vorlagePhase.id
      : null;

  const btnBase = 'px-4 py-2 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed';
  const btnGold = `${btnBase} bg-[#BCA075] text-white hover:bg-[#a88d65] disabled:opacity-40`;
  const btnGreen = `${btnBase} bg-green-600 text-white opacity-90`;
  const btnDisabled = `${btnBase} border border-gray-200 text-gray-400 opacity-60`;

  function renderVorlageButtons() {
    const phase = vorlagePhase;

    if (phase.kind === 'none') {
      return (
        <button
          className={btnGold}
          onClick={handleSaveAsNewVorlage}
          disabled={savingVorlage || !form.title}
        >
          {savingVorlage ? 'Speichern…' : 'Als Vorlage speichern'}
        </button>
      );
    }

    if (phase.kind === 'just-saved-new') {
      return <button className={btnGreen} disabled>Vorlage gespeichert ✓</button>;
    }

    if (phase.kind === 'just-updated') {
      return (
        <>
          <button className={btnDisabled} disabled>Als neue Vorlage speichern</button>
          <button className={btnGreen} disabled>Vorlage aktualisiert ✓</button>
        </>
      );
    }

    if (phase.kind === 'linked-clean') {
      return (
        <>
          <button className={btnDisabled} disabled>Als neue Vorlage speichern</button>
          <button className={btnDisabled} disabled>Vorlage aktualisieren</button>
        </>
      );
    }

    return (
      <>
        <button
          className={btnGold}
          onClick={handleSaveAsNewVorlage}
          disabled={savingVorlage || !form.title}
        >
          {savingVorlage ? 'Speichern…' : 'Als neue Vorlage speichern'}
        </button>
        <button
          className={btnGold}
          onClick={handleUpdateVorlage}
          disabled={savingVorlage}
        >
          {savingVorlage ? 'Aktualisieren…' : 'Vorlage aktualisieren'}
        </button>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {!editingId && vorlagen.length > 0 && (
        <div>
          <button
            onClick={() => setShowVorlagenPanel(p => !p)}
            className="text-sm text-[#BCA075] hover:underline flex items-center gap-1"
          >
            Vorlage verwenden {showVorlagenPanel ? '▲' : '▼'}
          </button>
          {showVorlagenPanel && (
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
              {vorlagen.map(v => (
                <div key={v.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-800">{v.name}</span>
                    <button
                      onClick={() => handleLoadVorlage(v)}
                      className="shrink-0 px-3 py-1 bg-[#BCA075] text-white text-xs rounded hover:bg-[#a88d65]"
                    >
                      Verwenden
                    </button>
                  </div>
                  <button
                    onClick={() => setExpandedVorlageId(expandedVorlageId === v.id ? null : v.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    {expandedVorlageId === v.id ? 'Details schließen ▲' : 'Mehr Details ▼'}
                  </button>
                  {expandedVorlageId === v.id && (
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      {v.hosts && <p><span className="text-gray-400 w-20 inline-block">Leiter:</span>{v.hosts}</p>}
                      {v.location && <p><span className="text-gray-400 w-20 inline-block">Ort:</span>{v.location}</p>}
                      {v.time && <p><span className="text-gray-400 w-20 inline-block">Uhrzeit:</span>{v.time} Uhr</p>}
                      {v.description && <p><span className="text-gray-400 w-20 inline-block">Beschreibung:</span>{v.description}</p>}
                      {v.price && <p><span className="text-gray-400 w-20 inline-block">Preis:</span>{v.price}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EventFormFields
          form={form}
          onChange={set}
          events={allEvents}
          showDate
          titleRequired
          conflicts={conflicts}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.title || !form.date}
            className="px-5 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Speichern…' : editingId ? 'Speichern' : 'Event hinzufügen'}
          </button>
          {editingId && onSaveAndUpdateVorlage && linkedVorlageId && (
              <button
                onClick={() => onSaveAndUpdateVorlage(form, linkedVorlageId)}
                disabled={isSaving || !form.title || !form.date}
                className="px-5 py-2 bg-[#3D5573] text-white rounded text-sm font-medium hover:bg-[#1A3352] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Speichern…' : 'Speichern + Vorlage aktualisieren'}
              </button>
          )}
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <span className="text-gray-200 select-none hidden sm:inline">|</span>
          <div className="flex flex-wrap gap-2">
            {renderVorlageButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VorlagenTab ──────────────────────────────────────────────────────────────

function VorlagenTab({
  vorlagen,
  onUpdate,
  onDelete,
  events,
}: {
  vorlagen: Vorlage[];
  onUpdate: (v: Vorlage) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  events: Veranstaltung[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Vorlage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEdit(v: Vorlage) {
    setEditingId(v.id);
    setEditForm({ ...v });
    setConfirmDelete(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(null);
  }

  function setField<K extends keyof Vorlage>(key: K, value: Vorlage[K]) {
    setEditForm(prev => prev ? { ...prev, [key]: value } : null);
  }

  async function handleSave() {
    if (!editForm) return;
    setSaving(true);
    setError('');
    try {
      await onUpdate(editForm);
      setEditingId(null);
      setEditForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError('');
    try {
      await onDelete(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen');
    } finally {
      setConfirmDelete(null);
    }
  }

  if (vorlagen.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-8 text-center">
        Noch keine Vorlagen. Erstelle eine beim Anlegen einer neuen Veranstaltung.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded">{error}</p>
      )}
      {vorlagen.map(v => (
        <div key={v.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {editingId === v.id && editForm ? (
            <div className="p-6 space-y-4">
              <Field label="Vorlagenname">
                <input
                  className={INPUT_CLS}
                  value={editForm.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="z.B. Gruppenmeditation Montag"
                />
              </Field>
              <EventFormFields
                form={editForm}
                onChange={(key, value) => setField(key, value as Vorlage[typeof key])}
                events={events}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name}
                  className="px-5 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Speichern…' : 'Vorlage speichern'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-5 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{v.name}</p>
                {v.name !== v.title && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{v.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {[v.hosts, v.location, v.time ? `${v.time} Uhr` : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3 text-xs whitespace-nowrap">
                <button onClick={() => startEdit(v)} className="text-[#BCA075] hover:underline">
                  Bearbeiten
                </button>
                {confirmDelete === v.id ? (
                  <>
                    <span className="text-gray-500">Sicher?</span>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:underline">Ja, löschen</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:underline">Abbrechen</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(v.id)} className="text-gray-400 hover:text-red-500">Löschen</button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── EventStatusBadges ───────────────────────────────────────────────────────

function EventStatusBadges({ event }: { event: Veranstaltung }) {
  return (
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
  );
}

// ─── EventRegistrationsTable ──────────────────────────────────────────────────

function EventRegistrationsTable({ registrations }: { registrations: EventRegistrationRecord[] }) {
  const eventTitles = Array.from(new Set(registrations.map(r => r.eventTitle).filter(Boolean))).sort();
  const countByTitle = useMemo(
    () => registrations.reduce((acc, r) => {
      if (r.eventTitle) acc.set(r.eventTitle, (acc.get(r.eventTitle) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
    [registrations],
  );
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
              {t} ({countByTitle.get(t) ?? 0})
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
                <th className="px-6 py-3">TM-Lehrer</th>
                <th className="px-6 py-3">Erlernt am</th>
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
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.tmLehrer || '—'}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{r.datumErlernen || '—'}</td>
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

// ─── AdminClient ──────────────────────────────────────────────────────────────

export default function AdminClient({
  infoRegistrations,
  initialEvents,
  eventRegistrations,
  initialVorlagen,
}: {
  infoRegistrations: Registration[];
  initialEvents: Veranstaltung[];
  eventRegistrations: EventRegistrationRecord[];
  initialVorlagen: Vorlage[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get('tab');
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'info-anmeldungen';

  function setTab(t: Tab) {
    router.replace(`?tab=${t}`, { scroll: false });
  }

  const [events, setEvents] = useState<Veranstaltung[]>(initialEvents);
  const [vorlagen, setVorlagen] = useState<Vorlage[]>(initialVorlagen);
  const [mode, setMode] = useState<Mode>({ view: 'list' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  function handleCopyLink(event: Veranstaltung) {
    const url = `${window.location.origin}/events?open=${eventSlug(event)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleTmwSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/tmw-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const { created, updated, deleted, skipped, errors } = data;
      const parts = [
        created.length && `${created.length} neu`,
        updated.length && `${updated.length} aktualisiert`,
        deleted.length && `${deleted.length} gelöscht`,
        skipped.length && `${skipped.length} übersprungen`,
        errors.length && `${errors.length} Fehler`,
      ].filter(Boolean);
      setSyncResult(parts.join(' · ') || 'Nichts zu tun');
    } catch (e) {
      setSyncResult(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSyncing(false);
    }
  }

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

  async function handleSaveAsVorlage(v: Omit<Vorlage, 'id'>): Promise<Vorlage> {
    const res = await fetch('/api/admin/vorlagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const saved: Vorlage = await res.json();
    setVorlagen(prev => [...prev, saved]);
    if (mode.view === 'edit') {
      const updated = { ...mode.event, vorlageId: saved.id };
      const linkRes = await fetch(`/api/admin/events/${mode.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!linkRes.ok) throw new Error((await linkRes.json()).error);
      setEvents(prev => prev.map(e => e.id === mode.event.id ? updated : e));
    }
    return saved;
  }

  async function handleUpdateVorlageData(id: string, data: Omit<Veranstaltung, 'id'>): Promise<void> {
    const existing = vorlagen.find(v => v.id === id);
    if (!existing) return;
    const updated: Vorlage = { ...data, id, name: existing.name };
    const res = await fetch(`/api/admin/vorlagen/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setVorlagen(prev => prev.map(v => v.id === id ? updated : v));
  }

  async function handleUpdateVorlageFull(v: Vorlage): Promise<void> {
    const res = await fetch(`/api/admin/vorlagen/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setVorlagen(prev => prev.map(vv => vv.id === v.id ? v : vv));
  }

  async function handleSaveAndUpdateVorlage(form: Omit<Veranstaltung, 'id'>, vorlageId: string) {
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
      await handleUpdateVorlageData(vorlageId, form);
      setMode({ view: 'list' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVorlage(id: string): Promise<void> {
    const res = await fetch(`/api/admin/vorlagen/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error);
    setVorlagen(prev => prev.filter(v => v.id !== id));
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
        <button className={TAB_CLS(tab === 'info-anmeldungen')} onClick={() => setTab('info-anmeldungen')}>
          <span className="sm:hidden">Info-Anm. ({infoRegistrations.length})</span>
          <span className="hidden sm:inline">Info-Anmeldungen ({infoRegistrations.length})</span>
        </button>
        <button className={TAB_CLS(tab === 'veranstaltungen')} onClick={() => setTab('veranstaltungen')}>
          <span className="sm:hidden">Events ({events.length})</span>
          <span className="hidden sm:inline">Veranstaltungen ({events.length})</span>
        </button>
        <button className={TAB_CLS(tab === 'anmeldungen')} onClick={() => setTab('anmeldungen')}>
          <span className="sm:hidden">Anm. ({eventRegistrations.length})</span>
          <span className="hidden sm:inline">Anmeldungen ({eventRegistrations.length})</span>
        </button>
        <button className={TAB_CLS(tab === 'vorlagen')} onClick={() => setTab('vorlagen')}>
          Vorlagen ({vorlagen.length})
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded">{error}</p>
      )}

      {tab === 'info-anmeldungen' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-700">Infovortrag-Anmeldungen</h2>
          </div>
          {infoRegistrations.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">Noch keine Anmeldungen.</p>
          ) : (
            <InfoRegistrationsTable registrations={infoRegistrations} />
          )}
        </div>
      )}

      {tab === 'veranstaltungen' && (
        <>
          {mode.view === 'list' && (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTmwSync}
                    disabled={syncing}
                    className="px-4 py-2 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncing ? 'Synchronisiere…' : 'TMW sync'}
                  </button>
                  {syncResult && (
                    <span className="text-xs text-gray-400">{syncResult}</span>
                  )}
                </div>
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
                <>
                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2">
                    {sortedEvents.map(event => (
                      <div key={event.id} className={`bg-white rounded-lg border border-gray-200 px-4 py-3 ${!event.visible ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{event.title}</p>
                            {event.subtitle && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{event.subtitle}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {event.date}{event.time ? ` · ${event.time} Uhr` : ''}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <EventStatusBadges event={event} />
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-4 text-xs">
                          <button
                            onClick={() => handleCopyLink(event)}
                            className="text-gray-400 hover:text-[#BCA075] transition-colors"
                          >
                            {copiedId === event.id ? '✓ Kopiert' : 'Link'}
                          </button>
                          <button
                            onClick={() => setMode({ view: 'edit', event })}
                            className="text-[#BCA075] hover:underline"
                          >
                            Bearbeiten
                          </button>
                          {confirmDelete === event.id ? (
                            <>
                              <span className="text-gray-500">Sicher?</span>
                              <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:underline">Ja</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:underline">Nein</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDelete(event.id)} className="text-gray-400 hover:text-red-500 ml-auto">
                              Löschen
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                              <EventStatusBadges event={event} />
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleCopyLink(event)}
                                className="text-xs text-gray-400 hover:text-[#BCA075] mr-4 transition-colors"
                                title="Newsletter-Link kopieren"
                              >
                                {copiedId === event.id ? '✓ Kopiert' : 'Link kopieren'}
                              </button>
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
                </>
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
                allEvents={events}
                vorlagen={vorlagen}
                onSaveAsVorlage={handleSaveAsVorlage}
                onUpdateVorlage={handleUpdateVorlageData}
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
                allEvents={events}
                editingId={mode.event.id}
                vorlagen={vorlagen}
                onSaveAsVorlage={handleSaveAsVorlage}
                onUpdateVorlage={handleUpdateVorlageData}
                onSaveAndUpdateVorlage={handleSaveAndUpdateVorlage}
              />
            </>
          )}
        </>
      )}

      {tab === 'anmeldungen' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-700">Anmeldungen für Veranstaltungen</h2>
          </div>
          <EventRegistrationsTable registrations={eventRegistrations} />
        </div>
      )}

      {tab === 'vorlagen' && (
        <VorlagenTab
          vorlagen={vorlagen}
          onUpdate={handleUpdateVorlageFull}
          onDelete={handleDeleteVorlage}
          events={events}
        />
      )}
    </>
  );
}
