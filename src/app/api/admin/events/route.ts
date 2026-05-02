import { getAllVeranstaltungen, createVeranstaltung } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { createCalendarEvent, isGuldeinEvent } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getAllVeranstaltungen();
    return Response.json(events);
  } catch (err) {
    console.error('Admin events GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Veranstaltung, 'id'> = await request.json();
    const event = await createVeranstaltung(body);

    if (isGuldeinEvent(event)) {
      try {
        await createCalendarEvent(event);
      } catch (calErr) {
        console.error('Google Calendar sync failed:', calErr);
      }
    }

    return Response.json(event, { status: 201 });
  } catch (err) {
    console.error('Admin events POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
