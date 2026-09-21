// Pure helpers for the offline Forschung headline batch (Slice 3a, ADR 0013).
//
// The card headline used to be the source sheet's terse "Specific Results" cell,
// which is sometimes a cryptic stub ("TC", "PTSD"). scripts/generate-headlines.ts
// generates one short, factual, human-readable English headline per study and
// persists it as a committed JSON (data/forschung/headlines.json), imported onto
// studies.headline. These two functions are the seams the batch and the read path
// share: deciding what still needs generating, and resolving the display headline.

// A study as the batch reads it from the corpus: the terse source label plus the
// parsed title and abstract, which give Claude enough context to write a headline.
export type HeadlineSource = { id: string; specificResults: string; title: string; abstract: string };

// The committed headline file: study id → generated English headline. Same flat
// id→string shape as data/forschung/doi-cache.json (loaded via loadDoiMap).
export type HeadlineFile = Record<string, string>;

// Studies that still need a generated headline: they have some source text to work
// from and no committed headline yet. Keeps the batch idempotent — a re-run only
// touches the gaps, so it survives a Claude quota cutoff.
export function pendingHeadlines(rows: HeadlineSource[], existing: HeadlineFile): HeadlineSource[] {
  return rows.filter((r) => {
    if (existing[r.id]?.trim()) return false;
    return !!(r.specificResults.trim() || r.title.trim() || r.abstract.trim());
  });
}

// Resolve the headline shown on a study card for the requested locale. Precedence:
// a translated headline (Slice 3b, for de/fr/es), then the locale's translated
// specific_results (the German sheet text — now the fallback for any study whose
// headline translation hasn't landed yet), then the canonical English headline
// (Slice 3a), then the raw English specific_results. Every locale stays graceful and
// never blank: a non-English card shows its translated headline once the batch has
// produced one, otherwise falls back through the locale's sheet text, the English
// headline, and finally the terse source label.
//
// Slice 3b (scripts/translate-headlines.ts) populates tr.headline for de/fr/es, so a
// translated headline now wins for every locale — deliberately superseding the older
// German sheet text (tr.specific_results), which the pre-3b library used because the
// only alternative then was regressing ~430 good German cells to English. The
// tr.specific_results rung is kept above the English row.headline so a study still
// missing its translated headline shows the locale's own text rather than English.
export function resolveHeadline(
  tr: Record<string, string>,
  row: { headline?: string | null; specific_results?: string | null },
): string {
  return tr.headline ?? tr.specific_results ?? row.headline ?? row.specific_results ?? '';
}
