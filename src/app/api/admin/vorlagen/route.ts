import { getAllVorlagen, createVorlage } from '@/lib/vorlagen';
import type { Vorlage } from '@/lib/vorlagen';
import { getCurrentTenant } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { tenant } = await getCurrentTenant();
    const vorlagen = await getAllVorlagen(tenant);
    return Response.json(vorlagen);
  } catch (err) {
    console.error('Admin vorlagen GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tenant } = await getCurrentTenant();
    const body: Omit<Vorlage, 'id'> = await request.json();
    const vorlage = await createVorlage(body, tenant);
    return Response.json(vorlage, { status: 201 });
  } catch (err) {
    console.error('Admin vorlagen POST failed:', err);
    return Response.json({ error: 'Fehler beim Erstellen.' }, { status: 500 });
  }
}
