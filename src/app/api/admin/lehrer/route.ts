import { getTeachersRaw } from '@/lib/teachers';
import { getSupabase } from '@/lib/supabase';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tenant = await getCurrentTenant();
    const [teachers, { data: assignments }] = await Promise.all([
      getTeachersRaw(tenant.tmw_center_ids),
      getSupabase()
        .from('teacher_languages')
        .select('teacher_name, locale, bio_override')
        .eq('tenant', tenant.tenant),
    ]);
    return Response.json({ teachers, assignments: assignments ?? [] });
  } catch (err) {
    console.error('Lehrer GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tenant = await getCurrentTenant();
    const rows: { teacher_name: string; locale: string; bio_override: string | null }[] =
      await request.json();

    const supabase = getSupabase();
    await supabase.from('teacher_languages').delete().eq('tenant', tenant.tenant);
    if (rows.length > 0) {
      const { error } = await supabase
        .from('teacher_languages')
        .insert(rows.map(r => ({ ...r, tenant: tenant.tenant })));
      if (error) throw error;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Lehrer PUT failed:', err);
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}
