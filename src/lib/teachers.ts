export type TMTeacher = {
  name: string;
  imageUrl: string;
  bio: string;
  email?: string;
  phone?: string;
};

type LocaleEntry = { teacher_name: string; bio_override: string | null };

export type ContactRow = {
  teacher_name: string;
  email: string | null;
  phone: string | null;
  use_center_contacts: boolean;
};

type CenterContact = { email: string; phone: string };

export function applyTeacherContacts(
  teachers: TMTeacher[],
  rows: ContactRow[],
  center: CenterContact
): TMTeacher[] {
  const byName = new Map(rows.map(r => [r.teacher_name, r]));
  return teachers.map(t => {
    const row = byName.get(t.name);
    if (!row) return t;
    const email = row.use_center_contacts ? center.email : row.email;
    const phone = row.use_center_contacts ? center.phone : row.phone;
    return { ...t, ...(email ? { email } : {}), ...(phone ? { phone } : {}) };
  });
}

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

export function hasMultipleCenterContacts(rows: { use_center_contacts: boolean }[]): boolean {
  return rows.filter(r => r.use_center_contacts).length > 1;
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
  tenant: { tmw_center_ids: number[]; tenant: string; contact_email: string; contact_phone: string }
): Promise<TMTeacher[]> {
  try {
    const deduped = await getTeachersRaw(tenant.tmw_center_ids);

    const { getSupabase } = await import("./supabase");
    const { data: contacts } = await getSupabase()
      .from("teacher_contacts")
      .select("teacher_name, email, phone, use_center_contacts")
      .eq("tenant", tenant.tenant);

    const withContacts = applyTeacherContacts(deduped, contacts ?? [], {
      email: tenant.contact_email,
      phone: tenant.contact_phone,
    });
    if (locale === "de") return withContacts;

    const { data: entries } = await getSupabase()
      .from("teacher_languages")
      .select("teacher_name, bio_override")
      .eq("locale", locale)
      .eq("tenant", tenant.tenant);

    const { getTranslation } = await import("./translate");
    const filtered = applyLocaleFilter(withContacts, entries ?? []);
    return Promise.all(
      filtered.map(async t => ({ ...t, bio: await getTranslation(t.bio, locale, "teacher bio") }))
    );
  } catch {
    return [];
  }
}
