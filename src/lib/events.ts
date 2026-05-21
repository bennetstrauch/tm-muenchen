export type TMEvent = {
  date: string;       // ISO: "2026-04-15"
  time: string;       // "19:00"
  type: "Präsenz" | "Online";
  location: string;
  registrationUrl: string;
  teacherName?: string;
};

// ── Demo fallback ─────────────────────────────────────────
const DEMO_EVENTS: TMEvent[] = [
  {
    date: "2026-04-22",
    time: "19:00",
    type: "Online",
    location: "Online",
    registrationUrl: "#",
  },
  {
    date: "2026-04-29",
    time: "19:00",
    type: "Präsenz",
    location: "Guldeinstr. 47, 80339 München",
    registrationUrl: "#",
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

  return (data.lectures as { date: string; webinar_link: string; teacher_name: string }[])
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
      } as TMEvent;
    });
}

// ── Main export ───────────────────────────────────────────
export async function getEvents(): Promise<TMEvent[]> {
  const token = process.env.TMW_API_KEY;
  if (!token) return DEMO_EVENTS;

  const today = new Date().toISOString().slice(0, 10);

  try {
    // Fetch both centers in parallel; if one fails, fall back gracefully
    const [center108, center109] = await Promise.allSettled([
      fetchCenter(108, token),
      fetchCenter(109, token),
    ]);

    const from108 = center108.status === "fulfilled" ? center108.value : [];
    const from109 = center109.status === "fulfilled" ? center109.value : [];

    // Build a set of online datetime keys already covered by center 108
    const onlineKeysCoveredBy108 = new Set(
      from108
        .filter((e) => e.type === "Online")
        .map((e) => `${e.date}|${e.time}`)
    );

    // From center 109: keep all in-person, drop online if 108 has one at same time
    const filtered109 = from109.filter(
      (e) => e.type !== "Online" || !onlineKeysCoveredBy108.has(`${e.date}|${e.time}`)
    );

    const merged = [...from108, ...filtered109]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    return merged;
  } catch (err) {
    console.error("[events] fetch failed, using demo data:", err);
    return DEMO_EVENTS;
  }
}

// ── Date formatting helper ────────────────────────────────
export function formatEventDate(isoDate: string): { weekday: string; date: string } {
  const d = new Date(`${isoDate}T12:00:00`);
  return {
    weekday: d.toLocaleDateString("de-DE", { weekday: "short" }),
    date: d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }),
  };
}

// Format: "Di 19, 20:00" — weekday abbrev (no dot) + day number + time.
// Hero shows 1 date on mobile, 2 on desktop; pass count=2 to keep the array small.
export function formatNextDates(events: TMEvent[], count = 2): string[] {
  return events.slice(0, count).map(e => {
    const d = new Date(`${e.date}T12:00:00`);
    const weekday = d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
    const day = d.getDate();
    return `${weekday} ${day}, ${e.time}`;
  });
}
