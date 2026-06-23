import { getAllVeranstaltungen, createVeranstaltung } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';
import { createCalendarEvent, isGuldeinEvent } from '@/lib/calendar';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { tenant } = await getCurrentTenant();
    const events = await getAllVeranstaltungen(tenant);
    return Response.json(events);
  } catch (err) {
    console.error('Admin events GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { tenant } = await getCurrentTenant();
    const body: Omit<Veranstaltung, 'id'> = await request.json();
    const event = await createVeranstaltung(body, tenant);

    let calendarStatus: string | null = null;
    if (isGuldeinEvent(event)) {
      try {
        await createCalendarEvent(event);
        calendarStatus = 'synced';
      } catch (calErr) {
        console.error('Google Calendar sync failed:', calErr);
        calendarStatus = calErr instanceof Error ? calErr.message : String(calErr);
      }
    } else {
      calendarStatus = `skipped – location "${event.location}" does not match Guldeinstr pattern`;
    }

    return Response.json({ ...event, _calendarStatus: calendarStatus }, { status: 201 });
  } catch (err) {
    console.error('Admin events POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
