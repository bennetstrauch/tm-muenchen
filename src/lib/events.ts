export type TMEvent = {
  date: string;       // ISO: "2026-04-15"
  time: string;       // "19:00"
  type: "Präsenz" | "Online";
  location: string;
  registrationUrl: string;
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

// ── Main export ───────────────────────────────────────────
export async function getEvents(): Promise<TMEvent[]> {
  const token = process.env.TMW_API_KEY;
  if (!token) return DEMO_EVENTS;

  try {
    const res = await fetch("https://tmw.meditation.de/api/center/108", {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TMW API error: ${res.status}`);

    const data = await res.json();
    const address = `${data.address1}, ${data.zip_code} ${data.city}`;
    const today = new Date().toISOString().slice(0, 10);

    const events: TMEvent[] = (data.lectures as {
      date: string;
      webinar_link: string;
    }[])
      .map((l) => {
        const { date, time } = parseTMWDate(l.date);
        const isOnline = !!l.webinar_link;
        return {
          date,
          time,
          type: isOnline ? "Online" : "Präsenz",
          location: isOnline ? "Online" : address,
          registrationUrl: l.webinar_link || "#",
        } as TMEvent;
      })
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    return events.length > 0 ? events : DEMO_EVENTS;
  } catch (err) {
    console.error("[events] TMW API fetch failed, using demo data:", err);
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
