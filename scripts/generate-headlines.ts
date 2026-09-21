// Run: npx tsx scripts/generate-headlines.ts  (npm run generate-headlines)
//   ...--limit N   generate at most N headlines this run (cheap smoke / chunking)
//
// Offline headline batch for the Forschung corpus (Slice 3a, ADR 0013). The card
// headline used to be the source sheet's terse "Specific Results" cell, which is
// sometimes a cryptic stub ("TC", "PTSD"). This produces one short, factual,
// human-readable *English* headline per study and persists it as a committed JSON
// (data/forschung/headlines.json) keyed by study id. scripts/import-forschung.ts
// then applies it onto studies.headline, so the running site never calls an API.
//
// Claude-only: this is rewriting, not translating (no DeepL). The corpus is read
// straight from the xlsx (same readCorpus + parseCitation + studyId the importer
// uses), so ids line up and the batch needs no Supabase — only ANTHROPIC_API_KEY.
// Idempotent and resumable: only studies still missing a headline are touched, and
// progress is flushed each batch, so a quota cutoff just means "re-run".
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { loadEnvLocal, readCorpus } from './forschung/source';
import { parseCitation } from '../src/lib/forschung/parse-citation';
import { studyId } from '../src/lib/forschung/study-id';
import { pendingHeadlines, type HeadlineFile, type HeadlineSource } from '../src/lib/forschung/headline';

const XLSX_PATH = 'data/forschung/january-2026-tm-research.xlsx';
const OUT_PATH = 'data/forschung/headlines.json';
const BATCH_SIZE = 10;
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const ABSTRACT_CONTEXT_CHARS = 600; // enough context for a headline without bloating the prompt

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadFile(path: string): HeadlineFile {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf-8')) as HeadlineFile;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}

async function claudeHeadlines(batch: HeadlineSource[], key: string): Promise<Record<string, string>> {
  const input = batch
    .map((b) =>
      [
        `###ID ${b.id}`,
        `[LABEL] ${b.specificResults}`,
        `[TITLE] ${b.title}`,
        `[ABSTRACT] ${b.abstract.slice(0, ABSTRACT_CONTEXT_CHARS)}`,
      ].join('\n'),
    )
    .join('\n\n');
  const prompt = [
    `You write short, human-readable headlines for a public library of peer-reviewed studies on Transcendental Meditation, aimed at a lay audience.`,
    ``,
    `For each study you get its terse internal label, its academic title, and the start of its abstract. Write ONE English headline that states the study's key finding in plain language.`,
    ``,
    `Rules:`,
    `- Short: at most ~8 words. A noun phrase, not a sentence. No trailing period.`,
    `- Factual and specific — state what the study actually found. NOT marketing, NOT a promise, no hype ("amazing", "proven", "cure").`,
    `- Expand cryptic labels: "TC" → the finding about a fourth state of consciousness; "PTSD" → the finding about PTSD symptoms. Never emit a bare abbreviation.`,
    `- Plain, warm, capitalised like a headline. Do not invent findings not supported by the title/abstract.`,
    ``,
    `Output format — for each study, emit exactly this block and nothing else:`,
    `###ID <the id>`,
    `<the headline>`,
    ``,
    `No JSON, no markdown, no commentary.`,
    ``,
    `Studies:`,
    input,
  ].join('\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content: { text: string }[] };
  const text = data.content[0].text;

  // Split on the ###ID markers (headlines are single-line, but parse defensively).
  const out: Record<string, string> = {};
  const blocks = text.split(/^###ID\s+/m).slice(1);
  for (const block of blocks) {
    const nl = block.indexOf('\n');
    if (nl === -1) continue;
    const id = block.slice(0, nl).trim();
    const headline = block.slice(nl + 1).trim().replace(/\.$/, '');
    if (id && headline) out[id] = headline;
  }
  return out;
}

async function main() {
  loadEnvLocal();
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set (add it to .env.local)');

  const corpus = await readCorpus(XLSX_PATH);
  const sources: HeadlineSource[] = corpus.map((row) => {
    const en = parseCitation(row.rawEn);
    return {
      id: studyId(en, row.rawEn),
      specificResults: row.specificResults,
      title: en.title,
      abstract: en.abstract,
    };
  });

  const file = loadFile(OUT_PATH);
  const limitArg = process.argv.indexOf('--limit');
  const limit = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : Infinity;
  const pending = pendingHeadlines(sources, file).slice(0, limit);
  console.log(`${sources.length} studies · ${pending.length} headlines to generate`);
  if (pending.length === 0) {
    console.log('Nothing to generate — headlines.json is up to date.');
    return;
  }

  let done = 0;
  const unresolved: string[] = [];
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const generated = await claudeHeadlines(batch, ANTHROPIC_KEY);
    for (const b of batch) {
      const headline = generated[b.id];
      if (headline?.trim()) {
        file[b.id] = headline.trim();
        done++;
      } else {
        unresolved.push(b.id);
      }
    }
    writeJson(OUT_PATH, file);
    console.log(`  …${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length} processed (${done} written)`);
    await sleep(200);
  }

  console.log(`✅ Generated ${done} headlines → ${OUT_PATH}`);
  if (unresolved.length) {
    console.warn(`⚠️  ${unresolved.length} studies got no headline and remain pending:`);
    console.warn(`   ${unresolved.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
