// Run: npx tsx scripts/find-tmw-center.ts <city>
// Scans TMW center IDs and prints centers matching the city name.
// Requires TMW_API_KEY env var.

import { readFileSync } from "fs";

try {
  const lines = readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const eq = line.indexOf("=");
    if (eq === -1 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* env vars must be set externally */ }

// ── Pure helpers (exported for tests) ────────────────────

const DE_MONTHS: Record<string, string> = {
  Januar: "01", Februar: "02", März: "03", April: "04",
  Mai: "05", Juni: "06", Juli: "07", August: "08",
  September: "09", Oktober: "10", November: "11", Dezember: "12",
};

function parseIsoDate(dateStr: string): string {
  const match = dateStr.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4})/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${DE_MONTHS[month] ?? "01"}-${day.padStart(2, "0")}`;
}

export function matchesCity(city: string, query: string): boolean {
  return city.toLowerCase().includes(query.toLowerCase());
}

export function countUpcoming(lectures: { date: string }[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return lectures.filter(l => parseIsoDate(l.date) >= today).length;
}

// ── Script ───────────────────────────────────────────────

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error("Usage: npx tsx scripts/find-tmw-center.ts <city>");
    process.exit(1);
  }

  const token = process.env.TMW_API_KEY;
  if (!token) {
    console.error("Error: TMW_API_KEY is not set.");
    process.exit(1);
  }

  const headers = { Authorization: `Token ${token}` };
  const ids = Array.from({ length: 300 }, (_, i) => i + 1);
  const BATCH = 20;
  const matches: { id: number; city: string; zip: string; lectureCount: number }[] = [];

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const r = await fetch(`https://tmw.meditation.de/api/center/${id}`, {
            headers,
            signal: AbortSignal.timeout(8000),
          });
          if (!r.ok) return;
          const data = await r.json() as { city: string; zip_code: string; lectures: { date: string }[] };
          if (data.city.startsWith("ZZZ")) return;
          if (!matchesCity(data.city, query)) return;
          matches.push({
            id,
            city: data.city,
            zip: data.zip_code,
            lectureCount: countUpcoming(data.lectures ?? []),
          });
        } catch { /* timeout or network error — skip */ }
      }),
    );
  }

  if (!matches.length) {
    console.log(`Keine Zentren gefunden für "${query}".`);
    return;
  }

  matches.sort((a, b) => a.id - b.id);
  for (const m of matches) {
    console.log(`ID ${m.id}\t${m.city} (${m.zip})\t${m.lectureCount} Vorträge`);
  }
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
