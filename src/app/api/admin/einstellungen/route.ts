import { getSupabase } from '@/lib/supabase';
import { getCurrentTenant, type TenantSettings } from '@/lib/tenant';

// The only tenant columns this tab may read or write. Acts as the whitelist:
// admin_password_hash, hostname, tenant, etc. can never be read out or written.
function pickSettings(source: Partial<TenantSettings>): TenantSettings {
  return {
    active_locales: source.active_locales ?? [],
    whatsapp_enabled: source.whatsapp_enabled ?? false,
    whatsapp_link: source.whatsapp_link ?? null,
    contact_email: source.contact_email ?? '',
    contact_phone: source.contact_phone ?? '',
  };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenant = await getCurrentTenant();
    return Response.json(pickSettings(tenant));
  } catch (err) {
    console.error('Einstellungen GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Partial<TenantSettings> = await request.json();
    const tenant = await getCurrentTenant();
    const { error } = await getSupabase()
      .from('tenants')
      .update(pickSettings(body))
      .eq('tenant', tenant.tenant);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Einstellungen PUT failed:', err);
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}
