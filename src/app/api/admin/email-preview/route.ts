import { buildCustomEmailHtml } from '@/lib/email-veranstaltung';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export async function POST(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { body, sampleName } = await request.json() as { body: string; sampleName?: string };
    const html = buildCustomEmailHtml(sampleName || 'Marlena', body ?? '');
    return Response.json({ html });
  } catch (err) {
    console.error('email-preview failed:', err);
    return Response.json({ error: 'Vorschau fehlgeschlagen.' }, { status: 500 });
  }
}
