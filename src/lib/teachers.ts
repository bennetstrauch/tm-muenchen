export type TMTeacher = {
  name: string;
  imageUrl: string;
  bio: string;
};

type LocaleEntry = { teacher_name: string; bio_override: string | null };

export function applyLocaleFilter(teachers: TMTeacher[], entries: LocaleEntry[]): TMTeacher[] {
  if (entries.length === 0) return teachers;
  const byName = new Map(entries.map(e => [e.teacher_name, e]));
  return teachers
    .filter(t => byName.has(t.name))
    .map(t => {
      const override = byName.get(t.name)!.bio_override;
      return override ? { ...t, bio: override } : t;
    });
}

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

export async function getTeachersRaw(centerIds: number[]): Promise<TMTeacher[]> {
  const token = process.env.TMW_API_KEY;
  if (!token || centerIds.length === 0) return [];
  try {
    const results = await Promise.allSettled(
      centerIds.map(id => fetchTeachersForCenter(id, token))
    );
    const seen = new Set<string>();
    return results
      .flatMap(r => (r.status === "fulfilled" ? r.value : []))
      .filter(t => {
        if (seen.has(t.name)) return false;
        seen.add(t.name);
        return true;
      });
  } catch {
    return [];
  }
}

export async function getTeachers(
  locale = "de",
  tenant: { tmw_center_ids: number[]; tenant: string }
): Promise<TMTeacher[]> {
  try {
    const deduped = await getTeachersRaw(tenant.tmw_center_ids);
    if (locale === "de") return deduped;

    const { getSupabase } = await import("./supabase");
    const { data: entries } = await getSupabase()
      .from("teacher_languages")
      .select("teacher_name, bio_override")
      .eq("locale", locale)
      .eq("tenant", tenant.tenant);

    const { getTranslation } = await import("./translate");
    const filtered = applyLocaleFilter(deduped, entries ?? []);
    return Promise.all(
      filtered.map(async t => ({ ...t, bio: await getTranslation(t.bio, locale, "teacher bio") }))
    );
  } catch {
    return [];
  }
}
