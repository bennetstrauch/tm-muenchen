import { list, del } from '@vercel/blob';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { blobs } = await list({ prefix: 'events/' });
    return Response.json({ urls: blobs.map(b => b.url) });
  } catch (err) {
    console.error('Images list failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) {
      return Response.json({ error: 'URL fehlt.' }, { status: 400 });
    }
    await del(url);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Image delete failed:', err);
    return Response.json({ error: 'Löschen fehlgeschlagen.' }, { status: 500 });
  }
}
