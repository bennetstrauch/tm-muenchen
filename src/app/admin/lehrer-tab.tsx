'use client';

import { useState, useEffect } from 'react';
import type { TMTeacher, ContactRow } from '@/lib/teachers';
import { INPUT_CLS as INPUT_BASE } from '@/lib/admin-styles';
import { isValidEmail } from '@/lib/validation';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

type Assignment = { teacher_name: string; locale: string; bio_override: string | null };

type ContactState = { email: string; phone: string; useCenterContacts: boolean };

type TeacherState = {
  locales: Set<string>;
  overrides: Record<string, string>;
  contact: ContactState;
};

const INPUT_CLS = `${INPUT_BASE} resize-y min-h-[60px]`;
const CHECK_CLS = 'h-4 w-4 accent-[#BCA075]';

export default function LehrerTab() {
  const [teachers, setTeachers] = useState<TMTeacher[]>([]);
  const [state, setState] = useState<Record<string, TeacherState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/lehrer')
      .then(r => r.json())
      .then(({ teachers: t, assignments, contacts }: { teachers: TMTeacher[]; assignments: Assignment[]; contacts: ContactRow[] }) => {
        setTeachers(t);
        const initial: Record<string, TeacherState> = {};
        for (const teacher of t) {
          const rows = assignments.filter(a => a.teacher_name === teacher.name);
          const contact = contacts.find(c => c.teacher_name === teacher.name);
          initial[teacher.name] = {
            locales: new Set(rows.map(r => r.locale)),
            overrides: Object.fromEntries(
              rows.filter(r => r.bio_override).map(r => [r.locale, r.bio_override!])
            ),
            contact: {
              email: contact?.email ?? '',
              phone: contact?.phone ?? '',
              useCenterContacts: contact?.use_center_contacts ?? false,
            },
          };
        }
        setState(initial);
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleLocale(name: string, locale: string) {
    setState(prev => {
      const ts = prev[name];
      const next = new Set(ts.locales);
      if (next.has(locale)) {
        next.delete(locale);
        const { [locale]: _, ...rest } = ts.overrides;
        return { ...prev, [name]: { ...ts, locales: next, overrides: rest } };
      }
      next.add(locale);
      return { ...prev, [name]: { ...ts, locales: next } };
    });
  }

  function setOverride(name: string, locale: string, value: string) {
    setState(prev => ({
      ...prev,
      [name]: { ...prev[name], overrides: { ...prev[name].overrides, [locale]: value } },
    }));
  }

  function setContact(name: string, patch: Partial<ContactState>) {
    setState(prev => ({
      ...prev,
      [name]: { ...prev[name], contact: { ...prev[name].contact, ...patch } },
    }));
  }

  async function handleSave() {
    for (const ts of Object.values(state)) {
      if (ts.contact.email.trim() && !isValidEmail(ts.contact.email.trim())) {
        setResult({ ok: false, msg: 'Ungültige E-Mail-Adresse.' });
        return;
      }
    }

    setSaving(true);
    setResult(null);
    const assignments: Assignment[] = [];
    const contacts: ContactRow[] = [];
    for (const [teacher_name, ts] of Object.entries(state)) {
      for (const locale of ts.locales) {
        assignments.push({ teacher_name, locale, bio_override: ts.overrides[locale] || null });
      }
      const { email, phone, useCenterContacts } = ts.contact;
      if (useCenterContacts || email.trim() || phone.trim()) {
        contacts.push({
          teacher_name,
          email: email.trim() || null,
          phone: phone.trim() || null,
          use_center_contacts: useCenterContacts,
        });
      }
    }
    try {
      const res = await fetch('/api/admin/lehrer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments, contacts }),
      });
      setResult(res.ok ? { ok: true, msg: 'Gespeichert.' } : { ok: false, msg: 'Fehler beim Speichern.' });
    } catch {
      setResult({ ok: false, msg: 'Fehler beim Speichern.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">Wird geladen…</p>;
  if (teachers.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">Keine Lehrer gefunden.</p>;

  return (
    <div className="space-y-4">
      {teachers.map(teacher => {
        const ts = state[teacher.name] ?? { locales: new Set(), overrides: {}, contact: { email: '', phone: '', useCenterContacts: false } };
        const centerUsedElsewhere = Object.entries(state).some(
          ([name, s]) => name !== teacher.name && s.contact.useCenterContacts
        );
        return (
          <div key={teacher.name} className="bg-white rounded-lg border border-gray-200 px-6 py-4">
            <p className="font-medium text-gray-800 mb-3">{teacher.name}</p>
            <div className="flex flex-wrap gap-6 mb-3">
              {LOCALES.map(({ code, label }) => (
                <label key={code} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className={CHECK_CLS}
                    checked={ts.locales.has(code)}
                    onChange={() => toggleLocale(teacher.name, code)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {LOCALES.filter(({ code }) => ts.locales.has(code)).map(({ code, label }) => (
              <div key={code} className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Bio-Überschreibung {label} (optional)</label>
                <textarea
                  className={INPUT_CLS}
                  value={ts.overrides[code] ?? ''}
                  onChange={e => setOverride(teacher.name, code, e.target.value)}
                  placeholder="Leer lassen für automatische Übersetzung"
                />
              </div>
            ))}

            <div className="border-t border-gray-100 mt-4 pt-4">
              <p className="text-xs text-gray-400 mb-2">Kontaktdaten anzeigen unter diesem Lehrer (optional)</p>
              {!ts.contact.useCenterContacts && (
                <div className="space-y-2 mb-3">
                  <input
                    type="email"
                    className={INPUT_BASE}
                    value={ts.contact.email}
                    onChange={e => setContact(teacher.name, { email: e.target.value })}
                    placeholder="E-Mail"
                  />
                  <input
                    className={INPUT_BASE}
                    value={ts.contact.phone}
                    onChange={e => setContact(teacher.name, { phone: e.target.value })}
                    placeholder="Telefon"
                  />
                </div>
              )}
              <label className={`flex items-center gap-2 text-sm ${centerUsedElsewhere ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className={CHECK_CLS}
                  checked={ts.contact.useCenterContacts}
                  disabled={centerUsedElsewhere}
                  onChange={e => setContact(teacher.name, { useCenterContacts: e.target.checked })}
                />
                Zentrums-Kontaktdaten verwenden
              </label>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
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
