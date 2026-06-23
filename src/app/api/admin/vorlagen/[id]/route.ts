import { updateVorlage, deleteVorlage } from '@/lib/vorlagen';
import type { Vorlage } from '@/lib/vorlagen';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const { tenant } = await getCurrentTenant();
    const body: Vorlage = await request.json();
    await updateVorlage({ ...body, id }, tenant);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin vorlagen PUT failed:', err);
    return Response.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const { tenant } = await getCurrentTenant();
    await deleteVorlage(id, tenant);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin vorlagen DELETE failed:', err);
    return Response.json({ error: 'Fehler beim Löschen.' }, { status: 500 });
  }
}
