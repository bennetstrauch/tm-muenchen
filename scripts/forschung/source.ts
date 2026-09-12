// Shared helpers for the Forschung import + DOI-enrichment scripts: load local
// env, flatten messy Excel cells, and read the corpus out of the source workbook.
import { readFileSync, existsSync } from 'fs';
import ExcelJS from 'exceljs';

// Reads an id→doi JSON map (the overrides and cache files), tolerating a missing
// file, and drops any documentation keys (leading underscore, e.g. "_comment").
export function loadDoiMap(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, string>;
  return Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith('_')));
}

// The import scripts read Supabase creds from .env.local (same approach as
// scripts/migrate-sheets-to-supabase.ts). getSupabase() reads process.env lazily,
// so this only needs to run before the first getSupabase() call.
export function loadEnvLocal(): void {
  try {
    for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
      const eq = line.indexOf('=');
      if (eq === -1 || line.trimStart().startsWith('#')) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* no .env.local — env vars must be set externally */
  }
}

// Excel cells arrive as plain strings, numbers, richText runs, or hyperlink
// objects whose `.text` is itself richText. Flatten any of them to plain text.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cellText(v: any): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map((t: unknown) => cellText((t as { text?: unknown }).text ?? t)).join('');
    if (v.text != null) return cellText(v.text);
    if (v.result != null) return cellText(v.result);
    if (v.hyperlink) return String(v.hyperlink);
  }
  return String(v);
}

export type SourceRow = {
  rowNum: number;
  topic: string;
  field: string;
  specialty: string;
  specificResults: string;
  rctFlag: string;
  year?: number;
  rawEn: string;
  rawDe: string;
  // Free German from the DE sheet's structured columns (its abstract in col H is
  // still English). These become locale='de' study_translations at import time.
  specialtyDe: string;
  specificResultsDe: string;
};

const EN_SHEET = 'All Research';
const DE_SHEET = 'Alle Forschung';
const FIRST_DATA_ROW = 15; // rows 1–14 are the legend + header block

// Reads the EN sheet as the source of record and the DE sheet by matching row
// position (see data/forschung/README.md). A row is a study when column A and
// column H are both present — this skips the trailing copyright footer.
export async function readCorpus(xlsxPath: string): Promise<SourceRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);
  const en = wb.getWorksheet(EN_SHEET);
  const de = wb.getWorksheet(DE_SHEET);
  if (!en) throw new Error(`Sheet "${EN_SHEET}" not found in ${xlsxPath}`);

  const rows: SourceRow[] = [];
  for (let r = FIRST_DATA_ROW; r <= en.rowCount; r++) {
    const enRow = en.getRow(r);
    const topic = cellText(enRow.getCell(1).value).trim();
    const rawEn = cellText(enRow.getCell(8).value).trim();
    if (!topic || !rawEn) continue;

    const yearText = cellText(enRow.getCell(6).value).trim();
    const year = /^\d{4}$/.test(yearText) ? Number(yearText) : undefined;
    const deRow = de ? de.getRow(r) : null;

    rows.push({
      rowNum: r,
      topic,
      field: cellText(enRow.getCell(2).value).trim(),
      specialty: cellText(enRow.getCell(3).value).trim(),
      specificResults: cellText(enRow.getCell(4).value).trim(),
      rctFlag: cellText(enRow.getCell(5).value).trim(),
      year,
      rawEn,
      rawDe: deRow ? cellText(deRow.getCell(8).value).trim() : '',
      specialtyDe: deRow ? cellText(deRow.getCell(3).value).trim() : '',
      specificResultsDe: deRow ? cellText(deRow.getCell(4).value).trim() : '',
    });
  }
  return rows;
}

// Column E holds "RCT", "Meta", or "Pilot" for the gold-standard studies (mostly
// empty). Only RCT / Meta-analysis count for the library's gold-standard toggle.
export function isRctMeta(rctFlag: string): boolean {
  return /\b(rct|meta)/i.test(rctFlag);
}
