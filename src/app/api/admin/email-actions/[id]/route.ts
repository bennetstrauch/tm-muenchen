import { getEmailActions, updateEmailAction, deleteEmailAction } from '@/lib/email-actions';
import type { EmailAction } from '@/lib/email-actions';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const data: EmailAction = await request.json();
    await updateEmailAction({ ...data, id });
    return Response.json({ success: true });
  } catch (err) {
    console.error('email-actions PUT failed:', err);
    return Response.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteEmailAction(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('email-actions DELETE failed:', err);
    const msg = err instanceof Error ? err.message : 'Fehler beim Löschen.';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const actions = await getEmailActions();
    const action = actions.find(a => a.id === id);
    if (!action) return Response.json({ error: 'Nicht gefunden.' }, { status: 404 });
    return Response.json(action);
  } catch (err) {
    console.error('email-actions GET[id] failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}
