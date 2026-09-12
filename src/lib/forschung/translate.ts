// Pure helpers for the offline Forschung translation batch (ADR 0013).
//
// The batch (scripts/translate-forschung.ts) produces translated study text as a
// committed JSON (data/forschung/translations/{locale}.json) keyed by study id.
// The import (scripts/import-forschung.ts) then upserts that JSON into
// study_translations. These two functions are the seams both sides share:
// deciding what still needs translating, and flattening the JSON into rows.

// The committed translation file: study id → per-field translated text. Fields
// mirror the translatable columns of a study (currently just 'abstract').
export type TranslationFile = Record<string, Record<string, string>>;

// A study as the batch reads it from the source of record: English abstract text.
export type AbstractSource = { id: string; abstract: string | null };

// Studies whose English abstract still needs a German translation: it has source
// text to translate and no committed translation yet. Keeps the batch idempotent
// — a re-run only touches the gaps, so it survives a DeepL/Claude quota cutoff.
export function pendingAbstracts(
  studies: AbstractSource[],
  existing: TranslationFile,
): { id: string; abstract: string }[] {
  return studies.flatMap((s) => {
    const abstract = (s.abstract ?? '').trim();
    if (!abstract) return [];
    if (existing[s.id]?.abstract) return [];
    return [{ id: s.id, abstract }];
  });
}

// A study_translations upsert row (locale-scoped, ADR 0013).
export type TranslationRow = {
  study_id: string;
  locale: string;
  field: string;
  value: string;
  updated_at: string;
};

// Flatten a committed translation file into study_translations rows for one
// locale. Empty values are dropped so a placeholder never overwrites a real
// English fallback via the overlay.
export function translationFileToRows(
  locale: string,
  file: TranslationFile,
  now: string,
): TranslationRow[] {
  return Object.entries(file).flatMap(([study_id, fields]) =>
    Object.entries(fields)
      .filter(([, value]) => value.trim().length > 0)
      .map(([field, value]) => ({ study_id, locale, field, value, updated_at: now })),
  );
}
