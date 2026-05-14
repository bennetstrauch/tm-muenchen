import { buildCustomEmailHtml } from '@/lib/email-veranstaltung';

export async function POST(request: Request) {
  try {
    const { body, sampleName } = await request.json() as { body: string; sampleName?: string };
    const html = buildCustomEmailHtml(sampleName || 'Marlena', body ?? '');
    return Response.json({ html });
  } catch (err) {
    console.error('email-preview failed:', err);
    return Response.json({ error: 'Vorschau fehlgeschlagen.' }, { status: 500 });
  }
}
