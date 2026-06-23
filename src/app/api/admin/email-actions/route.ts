import { getEmailActions, createEmailAction } from '@/lib/email-actions';
import type { EmailAction } from '@/lib/email-actions';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') ?? undefined;
    const actions = await getEmailActions(eventId);
    return Response.json(actions);
  } catch (err) {
    console.error('email-actions GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data: Omit<EmailAction, 'id'> = await request.json();
    const action = await createEmailAction(data);
    return Response.json(action, { status: 201 });
  } catch (err) {
    console.error('email-actions POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
