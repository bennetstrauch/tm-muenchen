type TmwCenterResponse = {
  lectures: { pk: number; webinar_link: string | null }[];
  teachers: { name: string }[];
};

type CenterResult =
  | { lectureCount: number; teachers: string[] }
  | { error: string };

export async function POST(request: Request) {
  const token = process.env.TMW_API_KEY;
  if (!token) {
    return Response.json({ error: "TMW_API_KEY not configured." }, { status: 500 });
  }

  const { centerIds } = await request.json() as { centerIds: number[] };
  const results: Record<number, CenterResult> = {};

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
        const today = new Date().toISOString().slice(0, 10);
        const upcomingLectures = (data.lectures ?? []).filter(
          l => !l.webinar_link && l.pk > 0,
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
