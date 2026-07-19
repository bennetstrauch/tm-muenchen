'use client';

import { useState, useEffect } from 'react';
import type { TenantSettings } from '@/lib/tenant';
import { INPUT_CLS } from '@/lib/admin-styles';

const ALL_LOCALES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

const CHECK_CLS = 'h-4 w-4 accent-[#BCA075]';

const DEFAULTS: TenantSettings = {
  active_locales: ['de', 'en', 'fr', 'es'],
  whatsapp_enabled: true,
  whatsapp_link: '',
  whatsapp_number: null,
  contact_email: '',
  contact_phone: '',
  center_image_url: null,
  infoabend_duration_minutes: 30,
  plz_abfrage: false,
  show_meditators_section: true,
  show_courses: false,
  course_locales: ['de'],
  impressum_content: '',
  google_business_url: null,
};

export default function EinstellungenTab() {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/einstellungen')
      .then(r => r.json())
      .then(data => { if (data) setSettings(data); })
      .finally(() => setLoading(false));
  }, []);

  function toggleLocale(code: string) {
    setSettings(prev => ({
      ...prev,
      active_locales: prev.active_locales.includes(code)
        ? prev.active_locales.filter(l => l !== code)
        : [...prev.active_locales, code],
    }));
  }

  async function handleCenterImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('prefix', 'center');
      const res = await fetch('/api/admin/images/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setSettings(prev => ({ ...prev, center_image_url: url }));
    } catch {
      setResult({ ok: false, msg: 'Bild-Upload fehlgeschlagen.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    const errors: Record<string, string> = {};
    if (!settings.contact_email.trim()) errors.contact_email = 'Pflichtfeld';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email)) errors.contact_email = 'Ungültige E-Mail-Adresse';
    if (!settings.contact_phone.trim()) errors.contact_phone = 'Pflichtfeld';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});

    setSaving(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/einstellungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setResult(res.ok ? { ok: true, msg: 'Gespeichert.' } : { ok: false, msg: 'Fehler beim Speichern.' });
    } catch {
      setResult({ ok: false, msg: 'Fehler beim Speichern.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">Wird geladen…</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 space-y-5">

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Aktive Sprachen</p>
          <div className="flex flex-wrap gap-5">
            {ALL_LOCALES.map(({ code, label }) => (
              <label key={code} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className={CHECK_CLS}
                  checked={settings.active_locales.includes(code)}
                  onChange={() => toggleLocale(code)}
                  disabled={code === 'de'}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Deutsch ist immer aktiv.</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">WhatsApp</p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-3">
            <input
              type="checkbox"
              className={CHECK_CLS}
              checked={settings.whatsapp_enabled}
              onChange={e => setSettings(prev => ({ ...prev, whatsapp_enabled: e.target.checked }))}
            />
            WhatsApp-Symbol im Kontaktbalken anzeigen
          </label>
          {settings.whatsapp_enabled && (
            <div className="space-y-2">
              <input
                className={INPUT_CLS}
                placeholder="https://chat.whatsapp.com/…"
                value={settings.whatsapp_link ?? ''}
                onChange={e => setSettings(prev => ({ ...prev, whatsapp_link: e.target.value || null }))}
              />
              <div>
                <input
                  className={INPUT_CLS}
                  placeholder="WhatsApp-Nummer (z. B. +49163…)"
                  value={settings.whatsapp_number ?? ''}
                  onChange={e => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value || null }))}
                />
                <p className="text-xs text-gray-400 mt-1">Nur ausfüllen, falls abweichend von der Kontakttelefonnummer</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Google-Profil</p>
          <input
            className={INPUT_CLS}
            placeholder="https://g.page/… (Link zu eurem Google-Unternehmensprofil)"
            value={settings.google_business_url ?? ''}
            onChange={e => setSettings(prev => ({ ...prev, google_business_url: e.target.value || null }))}
          />
          <p className="text-xs text-gray-400 mt-1">Für den &bdquo;Auf Google&ldquo;-Link auf der Seite und Suchmaschinen.</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Kontakt</p>
          <div className="space-y-2">
            <div>
              <input
                className={`${INPUT_CLS} ${fieldErrors.contact_email ? 'border-red-400' : ''}`}
                placeholder="E-Mail"
                value={settings.contact_email}
                onChange={e => { setSettings(prev => ({ ...prev, contact_email: e.target.value })); setFieldErrors(prev => ({ ...prev, contact_email: '' })); }}
              />
              {fieldErrors.contact_email && <p className="text-xs text-red-500 mt-1">{fieldErrors.contact_email}</p>}
            </div>
            <div>
              <input
                className={`${INPUT_CLS} ${fieldErrors.contact_phone ? 'border-red-400' : ''}`}
                placeholder="Telefon"
                value={settings.contact_phone}
                onChange={e => { setSettings(prev => ({ ...prev, contact_phone: e.target.value })); setFieldErrors(prev => ({ ...prev, contact_phone: '' })); }}
              />
              {fieldErrors.contact_phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.contact_phone}</p>}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Infoabend</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              className={`${INPUT_CLS} w-24`}
              value={settings.infoabend_duration_minutes}
              onChange={e => setSettings(prev => ({ ...prev, infoabend_duration_minutes: Number(e.target.value) || 30 }))}
            />
            <span className="text-sm text-gray-500">Minuten Dauer</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-3">
            <input
              type="checkbox"
              className={CHECK_CLS}
              checked={settings.plz_abfrage}
              onChange={e => setSettings(prev => ({ ...prev, plz_abfrage: e.target.checked }))}
            />
            PLZ im Anmeldeformular abfragen
          </label>
          <p className="text-xs text-gray-400 mt-1">Fragt Anmeldende nach ihrer PLZ (statt sie automatisch aus der IP zu schätzen).</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Für bereits Meditierende</p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className={CHECK_CLS}
              checked={settings.show_meditators_section}
              onChange={e => setSettings(prev => ({ ...prev, show_meditators_section: e.target.checked }))}
            />
            Veranstaltungen-Bereich und /events anzeigen
          </label>
          <p className="text-xs text-gray-400 mt-1">Deaktivieren für die nationale Seite (Deutschland).</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Kurs-Buchung</p>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-3">
            <input
              type="checkbox"
              className={CHECK_CLS}
              checked={settings.show_courses}
              onChange={e => setSettings(prev => ({ ...prev, show_courses: e.target.checked }))}
            />
            Kurs-Buchung anzeigen
          </label>
          {settings.show_courses && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Sprachen, in denen der Bereich angezeigt wird:</p>
              <div className="flex flex-wrap gap-4">
                {settings.active_locales.map(code => (
                  <label key={code} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className={CHECK_CLS}
                      checked={settings.course_locales.includes(code)}
                      disabled={code === 'de'}
                      onChange={e => setSettings(prev => ({
                        ...prev,
                        course_locales: e.target.checked
                          ? [...prev.course_locales, code]
                          : prev.course_locales.filter(l => l !== code),
                      }))}
                    />
                    {ALL_LOCALES.find(l => l.code === code)?.label ?? code}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Deutsch ist immer aktiv.</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Centerbild</p>
          {settings.center_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.center_image_url}
              alt="Centerbild Vorschau"
              className="w-full aspect-[3/2] object-cover rounded mb-2"
            />
          ) : (
            <p className="text-sm text-gray-400 mb-2">Kein Bild gesetzt.</p>
          )}
          <label className="inline-block cursor-pointer">
            <span className={`text-sm ${uploading ? 'text-gray-400' : 'text-[#BCA075] hover:underline cursor-pointer'}`}>
              {uploading ? 'Wird hochgeladen…' : 'Bild hochladen'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={handleCenterImageUpload}
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Impressum</p>
          <textarea
            className={`${INPUT_CLS} resize-y`}
            rows={12}
            value={settings.impressum_content}
            onChange={e => setSettings(prev => ({ ...prev, impressum_content: e.target.value }))}
          />
          <p className="text-xs text-gray-400 mt-1">HTML möglich. Leer lassen zeigt einen Platzhalter.</p>
        </div>

      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || settings.active_locales.length === 0}
          className="px-5 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
        {result && (
          <span className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-500'}`}>{result.msg}</span>
        )}
      </div>
    </div>
  );
}
