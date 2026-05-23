// Auto-translation script for TM München
// Translates delta keys from messages/de.json into en/fr/es locale files
// using the Claude API. Respects translation-locks.json and translation-glossary.json.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const LOCALES = ["en", "fr", "es"];
const LOCALE_NAMES = { en: "English", fr: "French", es: "Spanish" };
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.log("ANTHROPIC_API_KEY not set — skipping translation");
  process.exit(0);
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("_")) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") Object.assign(out, flatten(v, key));
    else out[key] = String(v);
  }
  return out;
}

function setDeep(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] ??= {};
    cur = cur[parts[i]];
  }
  cur[parts.at(-1)] = value;
}

// Current de.json
const deCurrent = JSON.parse(readFileSync("messages/de.json", "utf8"));
const flatDe = flatten(deCurrent);

// Previous de.json (parent commit) — to detect changes
let flatDePrev = {};
try {
  const prev = execSync("git show HEAD~1:messages/de.json", { encoding: "utf8" });
  flatDePrev = flatten(JSON.parse(prev));
} catch {
  console.log("No parent commit found — treating all keys as new");
}

// Keys that were added or changed in de.json since the last commit
const changedKeys = new Set(
  Object.keys(flatDe).filter((k) => flatDe[k] !== flatDePrev[k])
);
console.log(`Changed/new DE keys: ${changedKeys.size}`);

const locks = JSON.parse(readFileSync("src/i18n/translation-locks.json", "utf8"));
const glossary = JSON.parse(readFileSync("src/i18n/translation-glossary.json", "utf8"));

function buildGlossaryText(locale) {
  return Object.entries(glossary)
    .filter(([k]) => !k.startsWith("_"))
    .filter(([, v]) => v[locale])
    .map(([term, v]) => `- "${term}" → "${v[locale]}"`)
    .join("\n");
}

async function translateBatch(keysAndValues, locale) {
  const glossaryText = buildGlossaryText(locale);
  const sourceObj = Object.fromEntries(keysAndValues.map(([k, v]) => [k, v]));

  const prompt = [
    `You are translating marketing copy for TM München, a Transcendental Meditation center in Munich.`,
    `Target language: ${LOCALE_NAMES[locale]}`,
    `Tone: warm, direct, conversion-optimized. Preserve sentence structure where natural.`,
    `ICU placeholders like {count} or {current} must appear unchanged in the translation.`,
    `Newlines (\\n) inside strings are formatting — preserve them.`,
    ``,
    `Glossary — always use these exact translations:`,
    glossaryText,
    ``,
    `Translate each value from German. Return ONLY a JSON object mapping each key to its translation. No other text.`,
    ``,
    `Source strings:`,
    JSON.stringify(sourceObj, null, 2),
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in API response:\n" + text);
  return JSON.parse(match[0]);
}

for (const locale of LOCALES) {
  const localeFile = `messages/${locale}.json`;
  let localeData;
  try {
    localeData = JSON.parse(readFileSync(localeFile, "utf8"));
  } catch {
    localeData = {};
  }
  const flatLocale = flatten(localeData);
  const localeLocks = new Set(locks[locale] ?? []);

  // Translate: keys that changed in DE (and not locked) + keys missing from this locale
  const toTranslate = [
    ...[...changedKeys].filter((k) => !localeLocks.has(k)),
    ...Object.keys(flatDe).filter((k) => !(k in flatLocale) && !localeLocks.has(k)),
  ];
  const uniqueKeys = [...new Set(toTranslate)];

  if (uniqueKeys.length === 0) {
    console.log(`${locale}: nothing to translate`);
    continue;
  }

  console.log(`${locale}: translating ${uniqueKeys.length} keys...`);

  const BATCH_SIZE = 40;
  for (let i = 0; i < uniqueKeys.length; i += BATCH_SIZE) {
    const batch = uniqueKeys.slice(i, i + BATCH_SIZE);
    const pairs = batch.map((k) => [k, flatDe[k]]);
    const translated = await translateBatch(pairs, locale);

    for (const k of batch) {
      if (translated[k] !== undefined) {
        setDeep(localeData, k, translated[k]);
      } else {
        console.warn(`  Warning: no translation returned for key "${k}"`);
      }
    }
  }

  writeFileSync(localeFile, JSON.stringify(localeData, null, 2) + "\n", "utf8");
  console.log(`${locale}: done ✓`);
}
