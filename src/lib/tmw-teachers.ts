type TMWTeacherRaw = {
  name: string;
  email: string;
  phone_number: string;
  image_url: string;
  short_bio: string;
};

export type TMWTeacher = {
  name: string;
  email: string;
};

export async function lookupTeachersByFirstNames(firstNames: string[]): Promise<TMWTeacher[]> {
  if (firstNames.length === 0) return [];

  const token = process.env.TMW_API_KEY;
  if (!token) return [];

  try {
    const res = await fetch('https://tmw.meditation.de/api/center/108', {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = await res.json() as { teachers: TMWTeacherRaw[] };
    const teachers = data.teachers;
    const results: TMWTeacher[] = [];

    for (const firstName of firstNames) {
      const lower = firstName.trim().toLowerCase();
      const found = teachers.find(t => t.name.split(' ')[0].toLowerCase() === lower);
      if (found) results.push({ name: found.name.trim(), email: found.email });
    }

    return results;
  } catch {
    return [];
  }
}
