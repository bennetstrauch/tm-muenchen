// Run: npx tsx scripts/translate-headlines.ts --export   (npm run translate-headlines -- --export)
//      npx tsx scripts/translate-headlines.ts --merge    (after an agent fills the work files)
//   ...--locale de   restrict to one locale (default: de, fr, es)
//   ...--limit N     (export only) put at most N headlines per locale into the work file
//
// Offline headline-translation batch for the Forschung corpus (Slice 3b, ADR 0013).
// Slice 3a generated one English card headline per study into a committed JSON
// (data/forschung/headlines.json). This slice translates those headlines into
// German, French and Spanish and merges a `headline` field into each committed
// translation file (data/forschung/translations/{locale}.json), alongside the
// abstract. scripts/import-forschung.ts then upserts them into study_translations,
// and resolveHeadline shows the translated headline.
//
// The translation itself is done by a Claude Code agent in the CLI — NOT a paid
// translation API (ADR 0012, and consistent with the abstract batch, which was
// finished the same way). So this script is only the two ends of that handoff:
//
//   --export : write the still-untranslated headlines to a work file per locale,
//              data/forschung/translations/{locale}.work.json — a resumable list of
//              { id: { en, t } } where `t` (the translation) is left empty for the
//              agent to fill. Re-running only adds newly-pending ids, so it survives
//              a partial run.
//   --merge  : fold every filled `t` from the work files back into
//              data/forschung/translations/{locale}.json under the `headline` field,
//              then report how many entries the agent still left blank.
//
// The work files are gitignored (in-flight only); the committed output is the
// translation JSON. `pendingHeadlineTranslations` is the shared seam that decides
// what still needs translating (src/lib/forschung/translate.ts, tested).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { loadEnvLocal } from './forschung/source';
import {
  pendingHeadlineTranslations,
  type TranslationFile,
} from '../src/lib/forschung/translate';
import type { HeadlineFile } from '../src/lib/forschung/headline';

const HEADLINES_PATH = 'data/forschung/headlines.json';
const DEFAULT_LOCALES = ['de', 'fr', 'es'];
const translationsPath = (locale: string) => `data/forschung/translations/${locale}.json`;
const workPath = (locale: string) => `data/forschung/translations/${locale}.work.json`;

// One study's headline as the agent sees it: the English source and its (initially
// empty) translation. Same intermediate shape as the abstract batch's drafts file.
type WorkEntry = { en: string; t: string };
type WorkFile = Record<string, WorkEntry>;

function loadJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}

// Add every still-untranslated headline to the locale's work file for the agent to
// fill. Idempotent: ids the work file already holds keep whatever `t` the agent has
// written, so re-exporting after a partial pass only appends the new gaps.
function exportLocale(locale: string, headlines: HeadlineFile, limit: number): void {
  const translations = loadJson<TranslationFile>(translationsPath(locale), {});
  const work = loadJson<WorkFile>(workPath(locale), {});
  const pending = pendingHeadlineTranslations(headlines, translations).filter((p) => !work[p.id]);
  for (const { id, headline } of pending.slice(0, limit)) {
    work[id] = { en: headline, t: '' };
  }
  writeJson(workPath(locale), work);
  const blank = Object.values(work).filter((w) => !w.t.trim()).length;
  console.log(`[${locale}] ${pending.length} new · work file holds ${blank} awaiting translation → ${workPath(locale)}`);
}

// Fold the agent's filled translations back into the committed translation file.
// Empty `t` values are skipped so a half-finished work file never blanks a headline.
function mergeLocale(locale: string): void {
  const work = loadJson<WorkFile>(workPath(locale), {});
  const translations = loadJson<TranslationFile>(translationsPath(locale), {});
  let merged = 0;
  const blank: string[] = [];
  for (const [id, { t }] of Object.entries(work)) {
    if (!t.trim()) {
      blank.push(id);
      continue;
    }
    translations[id] = { ...translations[id], headline: t.trim() };
    merged++;
  }
  writeJson(translationsPath(locale), translations);
  console.log(`[${locale}] ✅ merged ${merged} headlines → ${translationsPath(locale)}`);
  if (blank.length) {
    console.warn(`[${locale}] ⚠️  ${blank.length} still blank in the work file: ${blank.join(', ')}`);
  }
}

function main(): void {
  loadEnvLocal();
  const argv = process.argv;
  const doExport = argv.includes('--export');
  const doMerge = argv.includes('--merge');
  if (doExport === doMerge) {
    throw new Error('Pass exactly one of --export or --merge.');
  }

  const localeArg = argv.indexOf('--locale');
  const locales = localeArg !== -1 ? [argv[localeArg + 1]] : DEFAULT_LOCALES;
  const limitArg = argv.indexOf('--limit');
  const limit = limitArg !== -1 ? Number(argv[limitArg + 1]) : Infinity;

  if (doExport) {
    const headlines = loadJson<HeadlineFile>(HEADLINES_PATH, {});
    if (Object.keys(headlines).length === 0) {
      throw new Error(`No headlines in ${HEADLINES_PATH} — run npm run generate-headlines first.`);
    }
    for (const locale of locales) exportLocale(locale, headlines, limit);
    console.log('\nNext: an agent fills the empty "t" values in each *.work.json, then `--merge`.');
    return;
  }

  for (const locale of locales) mergeLocale(locale);
  console.log('\n✅ Merge complete. Run `npm run import-forschung` to load the translations.');
}

main();
