import { getSupabase } from '../supabase';

// A single row of the research corpus. Global, not tenant-scoped (ADR 0012):
// every center shows the identical library, so there is no `tenant` field.
//
// `topic` and `specialty` are the canonical English taxonomy KEYS used for
// filtering; the visitor-facing display text (`specialtyLabel`, `specificResults`,
// `abstract`, …) is resolved for the requested locale, overlaid on the English
// source of record with an English fallback (ADR 0013).
export type Study = {
  id: string;
  topic: string;
  field: string;
  specialty: string;
  specialtyLabel: string;
  specificResults: string;
  isRctMeta: boolean;
  year?: number;
  authors: string;
  title: string;
  journal: string;
  abstract: string;
  abstractPending: boolean;
  citationRaw: string;
  doiUrl?: string;
};

type TranslationRow = { study_id: string; field: string; value: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any, tr: Record<string, string>, translated: boolean): Study {
  const abstract = row.abstract ?? '';
  return {
    id: row.id,
    topic: row.topic,
    field: row.field ?? '',
    specialty: row.specialty ?? '',
    specialtyLabel: tr.specialty ?? row.specialty ?? '',
    specificResults: tr.specific_results ?? row.specific_results ?? '',
    isRctMeta: row.is_rct_meta,
    year: row.year ?? undefined,
    authors: row.authors ?? '',
    title: row.title ?? '',
    journal: row.journal ?? '',
    abstract: tr.abstract ?? abstract,
    abstractPending: translated && !!abstract && tr.abstract === undefined,
    citationRaw: row.citation_raw,
    doiUrl: row.doi_url ?? undefined,
  };
}

// `locale` is a Forschung locale ('de' | 'en' | 'fr' | 'es' | …). English is the
// source of record, so it needs no overlay; every other locale reads its
// translations in one query and overlays them per study.
export async function getStudies(locale: string): Promise<Study[]> {
  const supabase = getSupabase();
  const translated = locale !== 'en';

  const [studiesResult, translationsResult] = await Promise.all([
    supabase.from('studies').select('*').order('year', { ascending: false }),
    translated
      ? supabase.from('study_translations').select('study_id, field, value').eq('locale', locale)
      : Promise.resolve({ data: [] as TranslationRow[], error: null }),
  ]);

  // A null data on the studies query means the request errored (an empty corpus
  // comes back as []). Fail loudly rather than serving an empty library.
  if (!studiesResult.data) throw new Error('getStudies: studies query returned no data');
  if (translationsResult.error) throw translationsResult.error;

  const byStudy = new Map<string, Record<string, string>>();
  for (const row of (translationsResult.data ?? []) as TranslationRow[]) {
    const fields = byStudy.get(row.study_id) ?? {};
    fields[row.field] = row.value;
    byStudy.set(row.study_id, fields);
  }

  return studiesResult.data.map((row) => fromRow(row, byStudy.get(row.id) ?? {}, translated));
}
