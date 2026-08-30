// Run: npx tsx scripts/enrich-forschung-doi.ts
//
// Resolves Publication links (DOIs) for imported studies that don't have one yet.
// Queries CrossRef (with a PubMed fallback), accepts a result only when
// isConfidentDoiMatch approves it, and both updates studies.doi_url and records
// the hit in data/forschung/doi-cache.json — so the offline import can re-apply
// them and re-runs skip already-resolved studies. Coverage is partial by nature.
//
// Run scripts/import-forschung.ts first (creates the rows). Safe to interrupt and
// re-run: it only looks at studies still missing a DOI.
import { writeFileSync } from 'fs';
import { loadEnvLocal, loadDoiMap } from './forschung/source';
import { isConfidentDoiMatch, type CrossRefWork } from '../src/lib/forschung/doi-match';
import type { ParsedCitation } from '../src/lib/forschung/parse-citation';

loadEnvLocal();
const { getSupabase } = await import('../src/lib/supabase');

const CACHE_PATH = 'data/forschung/doi-cache.json';
const MAILTO = process.env.FORSCHUNG_CROSSREF_MAILTO ?? 'info@tm-muenchen.de';
const THROTTLE_MS = 250; // be a polite CrossRef/PubMed citizen

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type StudyLite = {
  id: string;
  authors: string | null;
  title: string | null;
  journal: string | null;
  year: number | null;
};

function citationOf(s: StudyLite): ParsedCitation {
  return {
    authors: s.authors ?? '',
    title: s.title ?? '',
    journal: s.journal ?? '',
    year: s.year ?? undefined,
    abstract: '',
  };
}

async function crossRefLookup(c: ParsedCitation): Promise<CrossRefWork | null> {
  const q = encodeURIComponent(`${c.title} ${c.authors}`.trim());
  const url = `https://api.crossref.org/works?rows=5&query.bibliographic=${q}&mailto=${encodeURIComponent(MAILTO)}`;
  const res = await fetch(url, { headers: { 'User-Agent': `tm-muenchen-forschung (mailto:${MAILTO})` } });
  if (!res.ok) return null;
  const json = (await res.json()) as { message?: { items?: CrossRefWork[] } };
  for (const item of json.message?.items ?? []) {
    if (isConfidentDoiMatch(c, item)) return item;
  }
  return null;
}

// PubMed fallback: resolve to a PMID by title, fetch its summary, and reuse the
// same confidence gate against the article's title/authors/year (ELocationID DOI).
async function pubMedLookup(c: ParsedCitation): Promise<CrossRefWork | null> {
  const term = encodeURIComponent(`${c.title}`);
  const esearch = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=3&term=${term}`;
  const searchRes = await fetch(esearch);
  if (!searchRes.ok) return null;
  const ids = ((await searchRes.json()) as { esearchresult?: { idlist?: string[] } }).esearchresult?.idlist ?? [];
  if (ids.length === 0) return null;

  const esummary = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`;
  const sumRes = await fetch(esummary);
  if (!sumRes.ok) return null;
  const result = ((await sumRes.json()) as { result?: Record<string, unknown> }).result ?? {};

  for (const id of ids) {
    const doc = result[id] as
      | { title?: string; pubdate?: string; authors?: { name?: string }[]; elocationid?: string; articleids?: { idtype?: string; value?: string }[] }
      | undefined;
    if (!doc) continue;
    const doi =
      doc.articleids?.find((a) => a.idtype === 'doi')?.value ??
      doc.elocationid?.match(/10\.\d{4,9}\/\S+/)?.[0];
    if (!doi) continue;
    // PubMed `name` is "Family II" (family first); pubdate may lack a year — keep it
    // undefined rather than NaN so the confidence gate reads it correctly.
    const pubYear = (doc.pubdate ?? '').match(/\d{4}/)?.[0];
    const work: CrossRefWork = {
      DOI: doi,
      title: doc.title ? [doc.title] : [],
      author: (doc.authors ?? []).map((a) => ({ family: (a.name ?? '').split(' ')[0] })),
      issued: pubYear ? { 'date-parts': [[Number(pubYear)]] } : undefined,
    };
    if (isConfidentDoiMatch(c, work)) return work;
  }
  return null;
}

const supabase = getSupabase();
const { data, error } = await supabase
  .from('studies')
  .select('id, authors, title, journal, year')
  .is('doi_url', null);
if (error) throw error;

const studies = (data ?? []) as StudyLite[];
console.log(`${studies.length} studies without a DOI — looking up…`);

const cache = loadDoiMap(CACHE_PATH);
let found = 0;
let processed = 0;

for (const s of studies) {
  processed++;
  const c = citationOf(s);
  if (!c.title) continue;

  let match: CrossRefWork | null = null;
  try {
    match = await crossRefLookup(c);
    if (!match) {
      await sleep(THROTTLE_MS);
      match = await pubMedLookup(c);
    }
  } catch (e) {
    console.warn(`  lookup failed for ${s.id}: ${(e as Error).message}`);
  }

  if (match?.DOI) {
    const doiUrl = `https://doi.org/${match.DOI}`;
    cache[s.id] = doiUrl;
    const { error: upErr } = await supabase.from('studies').update({ doi_url: doiUrl }).eq('id', s.id);
    if (upErr) throw upErr;
    found++;
  }

  if (processed % 25 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
    console.log(`  …${processed}/${studies.length} processed, ${found} DOIs found`);
  }
  await sleep(THROTTLE_MS);
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
console.log(`✅ Enrichment complete: ${found} new DOIs (cache: ${CACHE_PATH}).`);
