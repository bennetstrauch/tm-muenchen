import { getAllVeranstaltungen, createVeranstaltung } from '@/lib/veranstaltungen';
import type { Veranstaltung } from '@/lib/veranstaltungen';

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
    return Response.json(event, { status: 201 });
  } catch (err) {
    console.error('Admin events POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
