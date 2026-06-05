'use client';

import { useState, useEffect } from 'react';
import type { TenantSettings } from '@/lib/tenant';

const ALL_LOCALES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';
const CHECK_CLS = 'h-4 w-4 accent-[#BCA075]';

const DEFAULTS: TenantSettings = {
  active_locales: ['de', 'en', 'fr', 'es'],
  whatsapp_enabled: true,
  whatsapp_link: '',
  contact_email: '',
  contact_phone: '',
};

export default function EinstellungenTab() {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

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

  async function handleSave() {
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
            WhatsApp-Button anzeigen
          </label>
          {settings.whatsapp_enabled && (
            <input
              className={INPUT_CLS}
              placeholder="https://chat.whatsapp.com/…"
              value={settings.whatsapp_link ?? ''}
              onChange={e => setSettings(prev => ({ ...prev, whatsapp_link: e.target.value || null }))}
            />
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Kontakt</p>
          <div className="space-y-2">
            <input
              className={INPUT_CLS}
              placeholder="E-Mail"
              value={settings.contact_email}
              onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
            />
            <input
              className={INPUT_CLS}
              placeholder="Telefon"
              value={settings.contact_phone}
              onChange={e => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
            />
          </div>
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
