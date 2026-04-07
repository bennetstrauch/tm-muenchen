/**
 * ─────────────────────────────────────────────────────────
 *  Events — Google Sheets data source
 * ─────────────────────────────────────────────────────────
 *  Setup:
 *  1. Create a Google Sheet with these exact column headers
 *     in row 1 (case-insensitive):
 *       datum | uhrzeit | art | ort | anmeldelink | aktiv
 *
 *  2. File → Share → "Für alle mit dem Link" (viewer)
 *
 *  3. File → Teilen → Im Web veröffentlichen →
 *     "Tabellenblatt 1" → "Kommagetrennte Werte (.csv)" → Veröffentlichen
 *     Copy the URL.
 *
 *  4. Paste the URL into .env.local as EVENTS_SHEET_URL=<url>
 *
 *  Column format:
 *    datum       2026-04-15          (ISO date, for correct sorting)
 *    uhrzeit     19:00
 *    art         Präsenz  OR  Online
 *    ort         z.B. "Schleißheimer Str. 42, München"  or  "Zoom"
 *    anmeldelink https://...
 *    aktiv       ja  (anything else hides the event)
 * ─────────────────────────────────────────────────────────
 *
 *  When Benjamin Hofer's API is ready, replace getEvents() with
 *  a fetch to his endpoint — the Event type and component stay the same.
 */

export type TMEvent = {
  date: string;       // ISO: "2026-04-15"
  time: string;       // "19:00"
  type: "Präsenz" | "Online";
  location: string;
  registrationUrl: string;
};

// ── Demo events shown when no sheet is configured ────────
const DEMO_EVENTS: TMEvent[] = [
  {
    date: "2026-04-22",
    time: "19:00",
    type: "Präsenz",
    location: "Schleißheimer Str. 42, München",
    registrationUrl: "#",
  },
  {
    date: "2026-04-29",
    time: "19:00",
    type: "Online",
    location: "Zoom",
    registrationUrl: "#",
  },
  {
    date: "2026-05-06",
    time: "19:00",
    type: "Präsenz",
    location: "Schleißheimer Str. 42, München",
    registrationUrl: "#",
  },
];

// ── CSV parser ────────────────────────────────────────────
function parseCSV(csv: string): TMEvent[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return DEMO_EVENTS;

  // Normalise headers
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const col = (row: string[], name: string) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? row[idx]?.trim().replace(/"/g, "") ?? "" : "";
  };

  const today = new Date().toISOString().slice(0, 10);

  return lines
    .slice(1)
    .map((line) => {
      // Simple CSV split (handles basic quoted fields)
      const row = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? line.split(",");
      const cleaned = row.map((v) => v.trim().replace(/^"|"$/g, ""));

      return {
        date: col(cleaned, "datum"),
        time: col(cleaned, "uhrzeit"),
        type: col(cleaned, "art").toLowerCase().includes("online") ? "Online" : "Präsenz",
        location: col(cleaned, "ort"),
        registrationUrl: col(cleaned, "anmeldelink") || "#",
        aktiv: col(cleaned, "aktiv").toLowerCase(),
      };
    })
    .filter((e) => e.aktiv === "ja" && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ aktiv: _aktiv, ...e }) => e) as TMEvent[];
}

// ── Main export ───────────────────────────────────────────
export async function getEvents(): Promise<TMEvent[]> {
  const sheetUrl = process.env.EVENTS_SHEET_URL;

  if (!sheetUrl) {
    // No sheet configured yet — return demo data
    return DEMO_EVENTS;
  }

  try {
    const res = await fetch(sheetUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();
    const events = parseCSV(csv);
    return events.length > 0 ? events : DEMO_EVENTS;
  } catch (err) {
    console.error("[events] Failed to fetch sheet, using demo data:", err);
    return DEMO_EVENTS;
  }
}

// ── Date formatting helper ────────────────────────────────
export function formatEventDate(isoDate: string): { weekday: string; date: string } {
  const d = new Date(`${isoDate}T12:00:00`); // noon avoids timezone edge cases
  return {
    weekday: d.toLocaleDateString("de-DE", { weekday: "short" }),
    date: d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }),
  };
}
