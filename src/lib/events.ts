export type TMEvent = {
  date: string;       // ISO: "2026-04-15"
  time: string;       // "19:00"
  type: "Präsenz" | "Online";
  location: string;
  registrationUrl: string;
  teacherName?: string;
  lectureId: number;  // TMW API pk — required for POST /api/booking
};

// ── Demo fallback ─────────────────────────────────────────
const DEMO_EVENTS: TMEvent[] = [
  {
    date: "2026-04-22",
    time: "19:00",
    type: "Online",
    location: "Online",
    registrationUrl: "#",
    lectureId: 0,
  },
  {
    date: "2026-04-29",
    time: "19:00",
    type: "Präsenz",
    location: "Guldeinstr. 47, 80339 München",
    registrationUrl: "#",
    lectureId: 0,
  },
];

// ── German date parser ────────────────────────────────────
const DE_MONTHS: Record<string, string> = {
  Januar: "01", Februar: "02", März: "03", April: "04",
  Mai: "05", Juni: "06", Juli: "07", August: "08",
  September: "09", Oktober: "10", November: "11", Dezember: "12",
};

function parseTMWDate(dateStr: string): { date: string; time: string } {
  // Input: "Sa., 11. April 2026 um 19:00"
  const match = dateStr.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4})\s+um\s+(\d{2}:\d{2})/);
  if (!match) return { date: "", time: "" };
  const [, day, month, year, time] = match;
  return {
    date: `${year}-${DE_MONTHS[month] ?? "01"}-${day.padStart(2, "0")}`,
    time,
  };
}

// ── Fetch + map a single center ───────────────────────────
async function fetchCenter(
  id: number,
  token: string
): Promise<TMEvent[]> {
  const res = await fetch(`https://tmw.meditation.de/api/center/${id}`, {
    headers: { Authorization: `Token ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMW API error ${id}: ${res.status}`);

  const data = await res.json();
  const address = `${data.address1}, ${data.zip_code} ${data.city}`;

  return (data.lectures as { pk: number; date: string; webinar_link: string; teacher_name: string }[])
    .map((l) => {
      const { date, time } = parseTMWDate(l.date);
      const isOnline = !!l.webinar_link;
      return {
        date,
        time,
        type: isOnline ? "Online" : "Präsenz",
        location: isOnline ? "Online" : address,
        registrationUrl: l.webinar_link || "#",
        teacherName: l.teacher_name?.trim() || undefined,
        lectureId: l.pk,
      } as TMEvent;
    });
}

// ── Main export ───────────────────────────────────────────
export async function getEvents(centerIds: number[] = [108, 109]): Promise<TMEvent[]> {
  const token = process.env.TMW_API_KEY;
  if (!token) return DEMO_EVENTS;

  const today = new Date().toISOString().slice(0, 10);

  try {
    const settled = await Promise.allSettled(centerIds.map(id => fetchCenter(id, token)));
    const [primary = [], ...rest] = settled.map(r => r.status === "fulfilled" ? r.value : []);

    // Secondary centers: keep all in-person events; drop online duplicates already in primary
    const primaryOnlineKeys = new Set(
      primary.filter(e => e.type === "Online").map(e => `${e.date}|${e.time}`)
    );
    const secondary = rest.flatMap(arr =>
      arr.filter(e => e.type !== "Online" || !primaryOnlineKeys.has(`${e.date}|${e.time}`))
    );

    return [...primary, ...secondary]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  } catch (err) {
    console.error("[events] fetch failed, using demo data:", err);
    return DEMO_EVENTS;
  }
}

const LOCALE_BCP47: Record<string, string> = {
  de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES",
};

// ── Date formatting helper ────────────────────────────────
export function formatEventDate(isoDate: string, locale = "de"): { weekday: string; date: string } {
  const d = new Date(`${isoDate}T12:00:00`);
  const bcp47 = LOCALE_BCP47[locale] ?? "de-DE";
  return {
    weekday: d.toLocaleDateString(bcp47, { weekday: "short" }),
    date: d.toLocaleDateString(bcp47, { day: "numeric", month: "long", year: "numeric" }),
  };
}

// Format: "Di 19, 20:00" — weekday abbrev (no dot) + day number + time.
// Hero shows 1 date on mobile, 2 on desktop; pass count=2 to keep the array small.
export function formatNextDates(events: TMEvent[], count = 2, locale = "de"): string[] {
  const bcp47 = LOCALE_BCP47[locale] ?? "de-DE";
  return events.slice(0, count).map(e => {
    const d = new Date(`${e.date}T12:00:00`);
    const weekday = d.toLocaleDateString(bcp47, { weekday: "short" }).replace(".", "");
    const day = d.getDate();
    return `${weekday} ${day}, ${e.time}`;
  });
}
