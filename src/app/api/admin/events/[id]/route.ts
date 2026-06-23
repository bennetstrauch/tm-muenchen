import { updateVeranstaltung, deleteVeranstaltung, getVeranstaltungById, updateWhatsappPosted } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { updateCalendarEvent, deleteCalendarEvent, isGuldeinEvent } from '@/lib/calendar';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const { whatsappPostedAt } = await request.json() as { whatsappPostedAt: string };
    if (!whatsappPostedAt) return Response.json({ error: 'whatsappPostedAt fehlt.' }, { status: 400 });
    const { tenant } = await getCurrentTenant();
    await updateWhatsappPosted(id, whatsappPostedAt, tenant);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin events PATCH failed:', err);
    return Response.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}

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
    const body: Veranstaltung = await request.json();
    const event = { ...body, id };
    await updateVeranstaltung(event, tenant);

    if (isGuldeinEvent(event)) {
      try {
        await updateCalendarEvent(event);
      } catch (calErr) {
        console.error('Google Calendar update failed:', calErr);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin events PUT failed:', err);
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
    const event = await getVeranstaltungById(id, tenant);
    await deleteVeranstaltung(id, tenant);
    if (event && isGuldeinEvent(event)) {
      try {
        await deleteCalendarEvent(id);
      } catch (calErr) {
        console.error('Google Calendar delete failed:', calErr);
      }
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin events DELETE failed:', err);
    return Response.json({ error: 'Fehler beim Löschen.' }, { status: 500 });
  }
}
