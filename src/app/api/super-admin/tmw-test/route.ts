type TmwLecture = { date: string; webinar_link: string | null };
type TmwCenterResponse = {
  lectures: TmwLecture[];
  teachers: { name: string }[];
};

type CenterResult =
  | { lectureCount: number; teachers: string[] }
  | { error: string };

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

export async function POST(request: Request) {
  const token = process.env.TMW_API_KEY;
  if (!token) {
    return Response.json({ error: "TMW_API_KEY not configured." }, { status: 500 });
  }

  const { centerIds } = await request.json() as { centerIds: number[] };
  const results: Record<number, CenterResult> = {};
  const today = new Date().toISOString().slice(0, 10);

  await Promise.all(
    centerIds.map(async (id) => {
      try {
        const res = await fetch(`https://tmw.meditation.de/api/center/${id}`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) {
          results[id] = { error: `API returned ${res.status}` };
          return;
        }
        const data = await res.json() as TmwCenterResponse;
        const upcomingLectures = (data.lectures ?? []).filter(
          l => parseIsoDate(l.date) >= today,
        );
        results[id] = {
          lectureCount: upcomingLectures.length,
          teachers: (data.teachers ?? []).map(t => t.name),
        };
      } catch (e) {
        results[id] = { error: e instanceof Error ? e.message : String(e) };
      }
    }),
  );

  return Response.json(results);
}
