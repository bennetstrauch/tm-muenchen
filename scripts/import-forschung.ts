// Run: npx tsx scripts/import-forschung.ts
//
// Reproducible import of the TM & TM-Sidhi research corpus into the global
// (non-tenant-scoped, ADR 0012) `studies` table. Reads the committed source
// workbook, parses the mashed citation cell best-effort, keys each study by a
// stable content hash, and upserts — so re-running an updated edition updates in
// place without duplicating. DOI links are applied offline here (hand overrides,
// then any DOI already inline in the cell, then the cache written by the separate
// enrichment pass, scripts/enrich-forschung-doi.ts). Studies with no link stay
// linkless by design (~60–80% coverage).
import { existsSync, readFileSync } from 'fs';
import { loadEnvLocal, readCorpus, isRctMeta, loadDoiMap, type SourceRow } from './forschung/source';
import { parseCitation } from '../src/lib/forschung/parse-citation';
import { studyId } from '../src/lib/forschung/study-id';
import { extractInlineDoi } from '../src/lib/forschung/doi-match';
import { translationFileToRows, type TranslationFile } from '../src/lib/forschung/translate';

const XLSX_PATH = 'data/forschung/january-2026-tm-research.xlsx';
const OVERRIDES_PATH = 'data/forschung/doi-overrides.json';
const CACHE_PATH = 'data/forschung/doi-cache.json';
// Committed translation files produced by scripts/translate-forschung.ts, one per
// non-English locale (ADR 0013). Each is upserted into study_translations.
const TRANSLATION_LOCALES = ['de', 'fr', 'es'];
const translationPath = (locale: string) => `data/forschung/translations/${locale}.json`;

async function main() {
  loadEnvLocal();
  const { getSupabase } = await import('../src/lib/supabase');

  const overrides = loadDoiMap(OVERRIDES_PATH);
  const cache = loadDoiMap(CACHE_PATH);

  const source = await readCorpus(XLSX_PATH);
  console.log(`Read ${source.length} studies from ${XLSX_PATH}`);

  let inlineDois = 0;
  const toRow = (row: SourceRow) => {
    const en = parseCitation(row.rawEn);
    const id = studyId(en, row.rawEn);
    const inline = extractInlineDoi(row.rawEn);
    if (inline) inlineDois++;

    return {
      id,
      topic: row.topic,
      field: row.field || null,
      specialty: row.specialty || null,
      specific_results: row.specificResults || null,
      is_rct_meta: isRctMeta(row.rctFlag),
      year: row.year ?? null,
      authors: en.authors || null,
      title: en.title || null,
      journal: en.journal || null,
      abstract: en.abstract || null,
      citation_raw: row.rawEn,
      doi_url: overrides[id] ?? inline ?? cache[id] ?? null,
      updated_at: new Date().toISOString(),
    };
  };

  // Key by content hash so identical citations collapse to one row (a second row
  // with the same id in a single upsert batch would error in Postgres). The DE
  // sheet's structured columns are free German (ADR 0013) and become locale='de'
  // study_translations, keyed by the same id so re-runs upsert in place.
  const byId = new Map<string, ReturnType<typeof toRow>>();
  const trById = new Map<string, Record<string, string>>();
  for (const row of source) {
    const mapped = toRow(row);
    byId.set(mapped.id, mapped);
    const de: Record<string, string> = {};
    if (row.specialtyDe) de.specialty = row.specialtyDe;
    if (row.specificResultsDe) de.specific_results = row.specificResultsDe;
    if (Object.keys(de).length) trById.set(mapped.id, de);
  }

  const rows = [...byId.values()];
  const now = new Date().toISOString();
  const knownIds = new Set(rows.map((r) => r.id));
  const translationRows = translationFileToRows('de', Object.fromEntries(trById), now);

  // Committed translation files (scripts/translate-forschung.ts) — e.g. German
  // abstracts. Upserted into the same study_translations table; a row whose id
  // isn't in the current corpus is skipped (a stale entry from an older edition).
  for (const locale of TRANSLATION_LOCALES) {
    const path = translationPath(locale);
    if (!existsSync(path)) continue;
    const file = JSON.parse(readFileSync(path, 'utf-8')) as TranslationFile;
    const fileRows = translationFileToRows(locale, file, now).filter((r) => knownIds.has(r.study_id));
    console.log(`Prepared ${fileRows.length} ${locale} study_translations (${path})`);
    translationRows.push(...fileRows);
  }
  const withDoi = rows.filter((r) => r.doi_url).length;
  console.log(
    `Prepared ${rows.length} unique studies · ${withDoi} with DOI ` +
      `(${inlineDois} inline, ${Object.keys(overrides).length} overrides, ${Object.keys(cache).length} cached)`,
  );
  console.log(`Prepared ${translationRows.length} DE study_translations (structured columns)`);

  const supabase = getSupabase();
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('studies').upsert(chunk, { onConflict: 'id' });
    if (error) throw error;
    console.log(`Upserted ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }

  for (let i = 0; i < translationRows.length; i += CHUNK) {
    const chunk = translationRows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from('study_translations')
      .upsert(chunk, { onConflict: 'study_id,locale,field' });
    if (error) throw error;
    console.log(`Upserted ${Math.min(i + CHUNK, translationRows.length)}/${translationRows.length} translations`);
  }

  console.log('✅ Import complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
