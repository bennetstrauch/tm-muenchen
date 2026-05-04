import { updateVorlage, deleteVorlage } from '@/lib/vorlagen';
import type { Vorlage } from '@/lib/vorlagen';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: Vorlage = await request.json();
    await updateVorlage({ ...body, id });
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin vorlagen PUT failed:', err);
    return Response.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deleteVorlage(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Admin vorlagen DELETE failed:', err);
    return Response.json({ error: 'Fehler beim Löschen.' }, { status: 500 });
  }
}
