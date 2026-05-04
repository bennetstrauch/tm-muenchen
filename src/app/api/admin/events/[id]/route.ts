import { updateVeranstaltung, deleteVeranstaltung } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { updateCalendarEvent, isGuldeinEvent } from '@/lib/calendar';

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
    await deleteVeranstaltung(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin events DELETE failed:', err);
    return Response.json({ error: 'Fehler beim Löschen.' }, { status: 500 });
  }
}
