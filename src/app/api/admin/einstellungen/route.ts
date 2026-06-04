import { getSupabase } from '@/lib/supabase';

// Local to the admin Einstellungen flow; the underlying table is migrated to
// `tenants` and this route is rewritten in #46.
type SiteSettings = {
  active_locales: string[];
  whatsapp_enabled: boolean;
  whatsapp_link: string | null;
  contact_email: string;
  contact_phone: string;
};

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
