'use client';

import { useState, useEffect } from 'react';
import { copySubset } from '@/lib/copy-subset';

const INPUT_CLS = 'w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#BCA075]';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

export default function TexteTab() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/texte')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Record<string, string>>;
      })
      .then(data => setValues(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaveState('saving');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/texte', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Fehler beim Speichern.');
      }
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Fehler beim Speichern.');
      setSaveState('error');
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400 p-4">Texte werden geladen…</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-600 p-4">Texte konnten nicht geladen werden. Bitte Seite neu laden.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        Diese Texte gelten für alle TM-Zentren. Änderungen werden automatisch in alle Sprachen übersetzt.
      </div>

      {copySubset.map(section => (
        <div key={section.label} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-700">{section.label}</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    className={`${INPUT_CLS} resize-y`}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    type="text"
                    className={INPUT_CLS}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="px-6 py-2.5 bg-[#BCA075] text-white text-sm font-medium rounded hover:bg-[#A88B63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveState === 'saving' ? 'Wird gespeichert…' : 'Speichern'}
        </button>
        {saveState === 'success' && (
          <span className="text-sm text-green-600">Gespeichert. Übersetzungen werden automatisch aktualisiert.</span>
        )}
        {saveState === 'error' && (
          <span className="text-sm text-red-600">{errorMsg}</span>
        )}
      </div>
    </div>
  );
}
