import { getTeachersRaw } from '@/lib/teachers';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [teachers, { data: assignments }] = await Promise.all([
      getTeachersRaw(),
      getSupabase().from('teacher_languages').select('teacher_name, locale, bio_override'),
    ]);
    return Response.json({ teachers, assignments: assignments ?? [] });
  } catch (err) {
    console.error('Lehrer GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const rows: { teacher_name: string; locale: string; bio_override: string | null }[] =
      await request.json();

    const supabase = getSupabase();
    await supabase.from('teacher_languages').delete().neq('teacher_name', '');
    if (rows.length > 0) {
      const { error } = await supabase.from('teacher_languages').insert(rows);
      if (error) throw error;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Lehrer PUT failed:', err);
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}
