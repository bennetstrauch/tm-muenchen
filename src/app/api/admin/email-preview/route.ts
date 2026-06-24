import { buildCustomEmailHtml } from '@/lib/email-veranstaltung';
import { checkAdminRequest } from '@/lib/admin-api-gate';
import { getCurrentTenant } from '@/lib/tenant';

export async function POST(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { body, sampleName } = await request.json() as { body: string; sampleName?: string };
    const tenant = await getCurrentTenant();
    const centerName = tenant.center_banner_label ?? `TM Center ${tenant.city}`;
    const html = buildCustomEmailHtml(sampleName || 'Marlena', body ?? '', { centerName, contactPhone: tenant.contact_phone || undefined });
    return Response.json({ html });
  } catch (err) {
    console.error('email-preview failed:', err);
    return Response.json({ error: 'Vorschau fehlgeschlagen.' }, { status: 500 });
  }
}
