import { getAllVorlagen, createVorlage } from '@/lib/vorlagen';
import type { Vorlage } from '@/lib/vorlagen';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vorlagen = await getAllVorlagen();
    return Response.json(vorlagen);
  } catch (err) {
    console.error('Admin vorlagen GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Omit<Vorlage, 'id'> = await request.json();
    const vorlage = await createVorlage(body);
    return Response.json(vorlage, { status: 201 });
  } catch (err) {
    console.error('Admin vorlagen POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
