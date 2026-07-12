import { getSupabase } from '@/lib/supabase';
import { getCurrentTenant, type TenantSettings } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

// The only tenant columns this tab may read or write. Acts as the whitelist:
// admin_password_hash, hostname, tenant, etc. can never be read out or written.
function pickSettings(source: Partial<TenantSettings>): TenantSettings {
  return {
    active_locales: source.active_locales ?? [],
    whatsapp_enabled: source.whatsapp_enabled ?? false,
    whatsapp_link: source.whatsapp_link ?? null,
    whatsapp_number: source.whatsapp_number ?? null,
    contact_email: source.contact_email ?? '',
    contact_phone: source.contact_phone ?? '',
    center_image_url: source.center_image_url ?? null,
    infoabend_duration_minutes: source.infoabend_duration_minutes ?? 30,
    show_meditators_section: source.show_meditators_section ?? true,
    show_courses: source.show_courses ?? false,
    course_locales: source.course_locales ?? ['de'],
    impressum_content: source.impressum_content ?? '',
    google_business_url: source.google_business_url ?? null,
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const tenant = await getCurrentTenant();
    return Response.json(pickSettings(tenant));
  } catch (err) {
    console.error('Einstellungen GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
