import { getEmailActions, updateEmailAction, deleteEmailAction } from '@/lib/email-actions';
import type { EmailAction } from '@/lib/email-actions';
import { checkAdminRequest } from '@/lib/admin-api-gate';
import { getCurrentTenant } from '@/lib/tenant';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { tenant } = await getCurrentTenant();
    const { id } = await context.params;
    const data: EmailAction = await request.json();
    await updateEmailAction(tenant, { ...data, id });
    return Response.json({ success: true });
  } catch (err) {
    console.error('email-actions PUT failed:', err);
    return Response.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { tenant } = await getCurrentTenant();
    const { id } = await context.params;
    await deleteEmailAction(tenant, id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('email-actions DELETE failed:', err);
    const msg = err instanceof Error ? err.message : 'Fehler beim Löschen.';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { tenant } = await getCurrentTenant();
    const { id } = await context.params;
    const actions = await getEmailActions(tenant);
    const action = actions.find(a => a.id === id);
    if (!action) return Response.json({ error: 'Nicht gefunden.' }, { status: 404 });
    return Response.json(action);
  } catch (err) {
    console.error('email-actions GET[id] failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}
