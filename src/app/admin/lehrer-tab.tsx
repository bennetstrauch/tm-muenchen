'use client';

import { useState, useEffect } from 'react';
import type { TMTeacher } from '@/lib/teachers';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

type Assignment = { teacher_name: string; locale: string; bio_override: string | null };

type TeacherState = {
  locales: Set<string>;
  overrides: Record<string, string>;
};

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075] resize-y min-h-[60px]';
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
      .then(({ teachers: t, assignments }: { teachers: TMTeacher[]; assignments: Assignment[] }) => {
        setTeachers(t);
        const initial: Record<string, TeacherState> = {};
        for (const teacher of t) {
          const rows = assignments.filter(a => a.teacher_name === teacher.name);
          initial[teacher.name] = {
            locales: new Set(rows.map(r => r.locale)),
            overrides: Object.fromEntries(
              rows.filter(r => r.bio_override).map(r => [r.locale, r.bio_override!])
            ),
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
        return { ...prev, [name]: { locales: next, overrides: rest } };
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

  async function handleSave() {
    setSaving(true);
    setResult(null);
    const rows: Assignment[] = [];
    for (const [teacher_name, ts] of Object.entries(state)) {
      for (const locale of ts.locales) {
        rows.push({ teacher_name, locale, bio_override: ts.overrides[locale] || null });
      }
    }
    try {
      const res = await fetch('/api/admin/lehrer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
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
        const ts = state[teacher.name] ?? { locales: new Set(), overrides: {} };
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
