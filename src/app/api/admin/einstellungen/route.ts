import { getSupabase } from '@/lib/supabase';
import { type SiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data } = await getSupabase()
      .from('settings')
      .select('*')
      .eq('tenant', 'muenchen')
      .single();
    return Response.json(data ?? null);
  } catch (err) {
    console.error('Einstellungen GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: SiteSettings = await request.json();
    const { error } = await getSupabase()
      .from('settings')
      .upsert({ ...body, tenant: 'muenchen' }, { onConflict: 'tenant' });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Einstellungen PUT failed:', err);
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}
