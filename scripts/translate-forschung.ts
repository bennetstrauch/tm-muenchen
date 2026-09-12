// Run: npx tsx scripts/translate-forschung.ts  (npm run translate-forschung)
//
// Offline translation batch for the Forschung corpus (ADR 0013). Produces German
// translations of the English study abstracts and persists them as a committed
// JSON (data/forschung/translations/de.json) keyed by study id → { abstract }.
// scripts/import-forschung.ts then upserts that file into study_translations, so
// the running site never calls a translation API (ADR 0012).
//
// Mechanism (ADR 0013): DeepL Free produces a first draft, then Claude refines it
// against the English source under the shared TM glossary. Idempotent and
// resumable — only studies still missing a committed German abstract are touched,
// and progress is flushed to disk each batch, so a DeepL/Claude quota cutoff just
// means "re-run next time".
//
// Requires DEEPL_API_KEY (free key ends in :fx) and ANTHROPIC_API_KEY in
// .env.local, plus SUPABASE_URL / SERVICE_ROLE_KEY (reads studies.abstract).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { loadEnvLocal } from './forschung/source';
import { pendingAbstracts, type TranslationFile } from '../src/lib/forschung/translate';

const LOCALE = 'de';
const OUT_PATH = `data/forschung/translations/${LOCALE}.json`;
const DRAFTS_PATH = `data/forschung/translations/${LOCALE}.drafts.json`;
const GLOSSARY_PATH = 'src/i18n/translation-glossary.json';
const BATCH_SIZE = 10; // DeepL allows 50/req; Claude refinement caps us lower
const CLAUDE_MODEL = 'claude-sonnet-4-6';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadFile(path: string): TranslationFile {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf-8')) as TranslationFile;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}

// The shared TM glossary (src/i18n/translation-glossary.json), rendered as
// EN → target-locale term pairs for the refinement prompt so scientific abstracts
// use the same wording as the marketing site ("Transcendental Meditation" →
// "Transzendentale Meditation").
function glossaryPairs(locale: string): string {
  const glossary = JSON.parse(readFileSync(GLOSSARY_PATH, 'utf-8')) as Record<
    string,
    Record<string, string>
  >;
  return Object.entries(glossary)
    .filter(([k]) => !k.startsWith('_'))
    .filter(([, v]) => v.en && v[locale])
    .map(([, v]) => `- "${v.en}" → "${v[locale]}"`)
    .join('\n');
}

// DeepL Free lives on a separate host; the :fx key suffix marks a free key.
function deeplEndpoint(key: string): string {
  return key.endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
}

async function deeplDraft(texts: string[], key: string): Promise<string[]> {
  const res = await fetch(deeplEndpoint(key), {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text: texts, source_lang: 'EN', target_lang: 'DE' }),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { translations: { text: string }[] };
  return data.translations.map((t) => t.text);
}

async function claudeRefine(
  batch: { id: string; en: string; de: string }[],
  key: string,
): Promise<Record<string, string>> {
  const input = batch
    .map((b) => `###ID ${b.id}\n[ENGLISH]\n${b.en}\n[GERMAN DRAFT]\n${b.de}`)
    .join('\n\n');
  const prompt = [
    `You are a professional scientific translator localising abstracts of peer-reviewed studies on Transcendental Meditation into German.`,
    ``,
    `For each study below you get the English source abstract and a machine-translated German draft. Return an improved German translation.`,
    ``,
    `Rules:`,
    `- Formal, precise scientific register — this is academic abstract text, NOT marketing copy. Do not simplify, embellish, or add or drop information.`,
    `- Correct any mistranslation, wrong terminology, or awkward phrasing in the draft; keep faithful, natural scientific German.`,
    `- Preserve numbers, statistics, p-values, units, and citation fragments exactly.`,
    `- Keep any leading citation/DOI/PMID fragment as-is if present in the source.`,
    ``,
    `Glossary — always use these exact German terms:`,
    glossaryPairs(LOCALE),
    ``,
    `Output format — for each study, emit exactly this block and nothing else:`,
    `###ID <the id>`,
    `<the final German abstract, on one or more lines>`,
    ``,
    `Do not repeat the English or the draft. No JSON, no markdown, no commentary.`,
    ``,
    `Studies:`,
    input,
  ].join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 8096, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content: { text: string }[] };
  const text = data.content[0].text;

  // Split on the ###ID markers rather than parsing JSON: abstract text carries
  // quotes and newlines that routinely break a JSON payload of this length.
  const out: Record<string, string> = {};
  const blocks = text.split(/^###ID\s+/m).slice(1);
  for (const block of blocks) {
    const nl = block.indexOf('\n');
    if (nl === -1) continue;
    const id = block.slice(0, nl).trim();
    const german = block.slice(nl + 1).trim();
    if (id && german) out[id] = german;
  }
  return out;
}

async function main() {
  loadEnvLocal();
  const DEEPL_KEY = process.env.DEEPL_API_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!DEEPL_KEY) throw new Error('DEEPL_API_KEY not set (add it to .env.local)');

  // `--drafts-only`: run just the free DeepL pass and stage the drafts (with their
  // English source) to de.drafts.json for offline Claude refinement — used when the
  // refinement runs in a Claude Code session instead of the paid Anthropic API.
  const draftsOnly = process.argv.includes('--drafts-only');
  if (!draftsOnly && !ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set (add it to .env.local)');

  const { getSupabase } = await import('../src/lib/supabase');
  const supabase = getSupabase();
  const { data, error } = await supabase.from('studies').select('id, abstract');
  if (error) throw error;

  const file = loadFile(OUT_PATH);
  // Optional `--limit N`: translate at most N abstracts this run. Handy for a
  // cheap end-to-end smoke, or to stay under the DeepL Free monthly quota by
  // chunking across runs (the batch is resumable, so it picks up where it left off).
  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : Infinity;
  const pending = pendingAbstracts(data ?? [], file).slice(0, limit);
  const totalChars = pending.reduce((n, p) => n + p.abstract.length, 0);
  console.log(
    `${data?.length ?? 0} studies · ${pending.length} abstracts to translate · ` +
      `${totalChars.toLocaleString()} source chars (DeepL Free quota: 500,000/month)`,
  );
  if (pending.length === 0) {
    console.log('Nothing to translate — de.json is up to date.');
    return;
  }

  if (draftsOnly) {
    const drafts: Record<string, { en: string; draft: string }> = {};
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      const deepl = await deeplDraft(batch.map((b) => b.abstract), DEEPL_KEY);
      batch.forEach((b, j) => (drafts[b.id] = { en: b.abstract, draft: deepl[j] ?? '' }));
      writeJson(DRAFTS_PATH, drafts);
      console.log(`  …${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length} drafted`);
      await sleep(200);
    }
    console.log(`✅ Drafted ${Object.keys(drafts).length} abstracts → ${DRAFTS_PATH}`);
    return;
  }

  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set (add it to .env.local)');
  let done = 0;
  const unresolved: string[] = [];
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const drafts = await deeplDraft(batch.map((b) => b.abstract), DEEPL_KEY);
    const refined = await claudeRefine(
      batch.map((b, j) => ({ id: b.id, en: b.abstract, de: drafts[j] ?? '' })),
      ANTHROPIC_KEY,
    );

    for (const b of batch) {
      const german = refined[b.id];
      if (german && german.trim()) {
        file[b.id] = { ...file[b.id], abstract: german.trim() };
        done++;
      } else {
        unresolved.push(b.id);
      }
    }

    writeJson(OUT_PATH, file);
    console.log(`  …${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length} processed (${done} written)`);
    await sleep(200);
  }

  console.log(`✅ Translated ${done} abstracts → ${OUT_PATH}`);
  // Ids still without a German abstract stay pending and are retried on the next
  // run — re-spending DeepL quota each time. Surface them so a persistently
  // unrefinable abstract is visible rather than lost in the per-batch log.
  if (unresolved.length) {
    console.warn(`⚠️  ${unresolved.length} abstracts got no refinement and remain untranslated:`);
    console.warn(`   ${unresolved.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
