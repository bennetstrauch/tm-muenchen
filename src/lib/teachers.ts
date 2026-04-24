export type TMTeacher = {
  name: string;
  imageUrl: string;
  bio: string;
};

async function fetchTeachersForCenter(id: number, token: string): Promise<TMTeacher[]> {
  const res = await fetch(`https://tmw.meditation.de/api/center/${id}`, {
    headers: { Authorization: `Token ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMW API error ${id}: ${res.status}`);

  const data = await res.json();
  return (data.teachers as { name: string; image_url: string; short_bio: string }[]).map(t => ({
    name: t.name.trim(),
    imageUrl: t.image_url,
    bio: t.short_bio,
  }));
}

export async function getTeachers(): Promise<TMTeacher[]> {
  const token = process.env.TMW_API_KEY;
  if (!token) return [];

  try {
    const [c108, c109] = await Promise.allSettled([
      fetchTeachersForCenter(108, token),
      fetchTeachersForCenter(109, token),
    ]);

    const from108 = c108.status === "fulfilled" ? c108.value : [];
    const from109 = c109.status === "fulfilled" ? c109.value : [];

    const seen = new Set<string>();
    return [...from108, ...from109].filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  } catch {
    return [];
  }
}
