import { updateVeranstaltung, deleteVeranstaltung, getVeranstaltungById, updateWhatsappPosted } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { updateCalendarEvent, deleteCalendarEvent, isGuldeinEvent } from '@/lib/calendar';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { whatsappPostedAt } = await request.json() as { whatsappPostedAt: string };
    if (!whatsappPostedAt) return Response.json({ error: 'whatsappPostedAt fehlt.' }, { status: 400 });
    await updateWhatsappPosted(id, whatsappPostedAt);
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
  try {
    const { id } = await context.params;
    const body: Veranstaltung = await request.json();
    const event = { ...body, id };
    await updateVeranstaltung(event);

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
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const event = await getVeranstaltungById(id);
    await deleteVeranstaltung(id);
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
