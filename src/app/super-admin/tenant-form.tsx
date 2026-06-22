'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TenantConfig } from '@/lib/tenant';

const LOCALES = ['de', 'en', 'fr', 'es'] as const;

type TmwResult =
  | { lectureCount: number; teachers: string[] }
  | { error: string };

type Props = {
  tenant?: TenantConfig;
};

export default function TenantForm({ tenant }: Props) {
  const router = useRouter();
  const isEdit = !!tenant;

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tmwResults, setTmwResults] = useState<Record<number, TmwResult> | null>(null);
  const [testing, setTesting] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(tenant?.whatsapp_enabled ?? false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    if (!isEdit && !fd.get('tenant')) errs.tenant = 'Pflichtfeld';
    if (!fd.get('hostname')) errs.hostname = 'Pflichtfeld';
    if (!fd.get('city')) errs.city = 'Pflichtfeld';
    if (!isEdit && !fd.get('password')) errs.password = 'Pflichtfeld';
    if (!fd.get('tmw_center_ids')) errs.tmw_center_ids = 'Pflichtfeld';
    if (!fd.get('contact_email')) errs.contact_email = 'Pflichtfeld';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('contact_email')))) errs.contact_email = 'Ungültige E-Mail-Adresse';
    if (!fd.get('contact_phone')) errs.contact_phone = 'Pflichtfeld';
    if (!fd.get('from_email')) errs.from_email = 'Pflichtfeld';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    const active_locales = LOCALES.filter(l => fd.get(`locale_${l}`) === 'on');

    const body = {
      tenant: fd.get('tenant'),
      hostname: fd.get('hostname'),
      city: fd.get('city'),
      password: fd.get('password'),
      active_locales,
      tmw_center_ids: fd.get('tmw_center_ids'),
      contact_email: fd.get('contact_email'),
      contact_phone: fd.get('contact_phone'),
      from_email: fd.get('from_email'),
      instagram_link: fd.get('instagram_link'),
      whatsapp_enabled: fd.get('whatsapp_enabled') === 'on',
      whatsapp_link: fd.get('whatsapp_link'),
      whatsapp_number: fd.get('whatsapp_number') || null,
      show_teachers: fd.get('show_teachers') === 'on',
      show_meditators_section: fd.get('show_meditators_section') === 'on',
      center_image_url: fd.get('center_image_url'),
      logo_url: fd.get('logo_url'),
      logo_label: fd.get('logo_label'),
      infoabend_duration_minutes: Number(fd.get('infoabend_duration_minutes') ?? 30),
      center_banner_label: fd.get('center_banner_label'),
      impressum_content: fd.get('impressum_content'),
    };

    const url = isEdit
      ? `/api/super-admin/tenants/${tenant.tenant}`
      : '/api/super-admin/tenants';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => router.push('/super-admin'), 900);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Fehler beim Speichern.');
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleTmwTest(e: React.MouseEvent) {
    e.preventDefault();
    const input = (document.getElementById('tmw_center_ids') as HTMLInputElement)?.value ?? '';
    const centerIds = input
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (!centerIds.length) return;

    setTesting(true);
    setTmwResults(null);
    const res = await fetch('/api/super-admin/tmw-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centerIds }),
    });
    const data = await res.json();
    setTmwResults(data);
    setTesting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/super-admin" className="text-xs text-gray-400 hover:text-gray-600 mb-3 inline-block">
            ← Zurück zur Übersicht
          </a>
          <p className="text-xs tracking-widest uppercase text-[#BCA075] mb-1">Super-Admin</p>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEdit ? `Tenant: ${tenant.tenant}` : 'Neuer Tenant'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-medium">Fehler:</span> {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Gespeichert — wird weitergeleitet…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">

          <Section title="Identität">
            <Field label="Slug (z.B. muenchen)" required>
              <input name="tenant" defaultValue={tenant?.tenant} readOnly={isEdit}
                className={inputCls(isEdit, !!fieldErrors.tenant)} />
              <FieldError msg={fieldErrors.tenant} />
            </Field>
            <Field label="Hostname (z.B. tm-muenchen.de)" required>
              <input name="hostname" defaultValue={tenant?.hostname} className={inputCls(false, !!fieldErrors.hostname)} />
              <FieldError msg={fieldErrors.hostname} />
            </Field>
            <Field label="Stadt (Anzeigename)" required>
              <input name="city" defaultValue={tenant?.city} className={inputCls(false, !!fieldErrors.city)} />
              <FieldError msg={fieldErrors.city} />
            </Field>
          </Section>

          <Section title="Admin-Passwort">
            <Field label={isEdit ? 'Neues Passwort (leer lassen = unverändert)' : 'Passwort'} required={!isEdit}>
              <input name="password" type="password" autoComplete="new-password"
                className={inputCls(false, !!fieldErrors.password)} />
              <FieldError msg={fieldErrors.password} />
            </Field>
          </Section>

          <Section title="Sprachen">
            <div className="flex gap-4 flex-wrap">
              {LOCALES.map(l => (
                <label key={l} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`locale_${l}`}
                    defaultChecked={tenant?.active_locales?.includes(l) ?? l === 'de'}
                    className="rounded border-gray-300 text-[#BCA075]"
                  />
                  {l.toUpperCase()}
                </label>
              ))}
            </div>
          </Section>

          <Section title="TMW API">
            <Field label="Center IDs (kommagetrennt, z.B. 108, 109)" required>
              <div className="flex gap-2">
                <input
                  id="tmw_center_ids"
                  name="tmw_center_ids"
                  defaultValue={tenant?.tmw_center_ids?.join(', ')}
                  className={`${inputCls(false, !!fieldErrors.tmw_center_ids)} flex-1`}
                />
                <button
                  onClick={handleTmwTest}
                  disabled={testing}
                  className="px-3 py-2 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                >
                  {testing ? 'Teste…' : 'Verbindung testen'}
                </button>
              </div>
            </Field>
            <FieldError msg={fieldErrors.tmw_center_ids} />
            {tmwResults && (
              <div className="mt-2 rounded border border-gray-100 bg-gray-50 p-3 text-xs space-y-1">
                {Object.entries(tmwResults).map(([id, result]) => (
                  <div key={id}>
                    <span className="font-mono text-gray-500">ID {id}:</span>{' '}
                    {'error' in result
                      ? <span className="text-red-500">{result.error}</span>
                      : <span className="text-green-700">✓ {result.lectureCount} Vorträge · {result.teachers.join(', ')}</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Kontakt & E-Mail">
            <Field label="Kontakt-E-Mail" required>
              <input name="contact_email" type="email" defaultValue={tenant?.contact_email} className={inputCls(false, !!fieldErrors.contact_email)} />
              <FieldError msg={fieldErrors.contact_email} />
            </Field>
            <Field label="Kontakt-Telefon" required>
              <input name="contact_phone" defaultValue={tenant?.contact_phone} className={inputCls(false, !!fieldErrors.contact_phone)} />
              <FieldError msg={fieldErrors.contact_phone} />
            </Field>
            <Field label="Absender-E-Mail (Resend) — Format: TM Stadt <slug@post.meditation.de>" required>
              <input name="from_email" type="text" defaultValue={tenant?.from_email} className={inputCls(false, !!fieldErrors.from_email)} />
              <FieldError msg={fieldErrors.from_email} />
            </Field>
          </Section>

          <Section title="Social Media">
            <Field label="Instagram-Link">
              <input name="instagram_link"
                defaultValue={tenant?.instagram_link ?? 'https://www.instagram.com/tmdeutschland'}
                className={inputCls()} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="whatsapp_enabled"
                checked={whatsappEnabled}
                onChange={e => setWhatsappEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#BCA075]"
              />
              WhatsApp-Symbol im Kontaktbalken anzeigen
            </label>
            {whatsappEnabled && (
              <Field label="WhatsApp-Nummer (falls abweichend von Kontakttelefon)">
                <input name="whatsapp_number" defaultValue={tenant?.whatsapp_number ?? ''} className={inputCls()} />
              </Field>
            )}
            <Field label="WhatsApp-Community-Link">
              <input name="whatsapp_link" defaultValue={tenant?.whatsapp_link ?? ''} className={inputCls()} />
            </Field>
          </Section>

          <Section title="Weitere Einstellungen">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="show_teachers"
                defaultChecked={tenant?.show_teachers ?? true}
                className="rounded border-gray-300 text-[#BCA075]"
              />
              Lehrer-Section anzeigen
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="show_meditators_section"
                defaultChecked={tenant?.show_meditators_section ?? true}
                className="rounded border-gray-300 text-[#BCA075]"
              />
              Für bereits Meditierende (Veranstaltungen / /events) anzeigen
            </label>
            <Field label="Infoabend-Dauer (Minuten)">
              <input
                name="infoabend_duration_minutes"
                type="number"
                min={1}
                defaultValue={tenant?.infoabend_duration_minutes ?? 30}
                className={inputCls()}
              />
            </Field>
            <Field label="Center-Bild URL">
              <input name="center_image_url" defaultValue={tenant?.center_image_url ?? ''} className={inputCls()} />
            </Field>
            <Field label="Logo-Bild URL">
              <input name="logo_url" defaultValue={tenant?.logo_url ?? ''} placeholder="https://..." className={inputCls()} />
            </Field>
            <Field label="Logo-Bezeichnung">
              <input name="logo_label" defaultValue={tenant?.logo_label ?? ''} placeholder="z. B. TRANSZENDENTALE MEDITATION" className={inputCls()} />
            </Field>
            <Field label="CenterBanner-Bezeichnung">
              <input
                name="center_banner_label"
                defaultValue={tenant?.center_banner_label ?? ''}
                placeholder={`TM CENTER ${tenant?.city?.toUpperCase() ?? 'MÜNCHEN'} (Standard)`}
                className={inputCls()}
              />
            </Field>
            <Field label="Impressum-Inhalt">
              <textarea name="impressum_content" defaultValue={tenant?.impressum_content ?? ''}
                rows={4} className={`${inputCls()} resize-y`} />
            </Field>
          </Section>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || saved}
              className="px-5 py-2 bg-[#BCA075] text-white rounded text-sm font-medium hover:bg-[#a88d65] disabled:opacity-50"
            >
              {saved ? '✓ Gespeichert' : saving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
            <a href="/super-admin" className="px-5 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">
              Abbrechen
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function inputCls(readOnly = false, hasError = false) {
  return `w-full border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none ${
    hasError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#BCA075]'
  } ${readOnly ? 'bg-gray-50 text-gray-400' : ''}`;
}
