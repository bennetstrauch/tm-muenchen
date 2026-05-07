import { list, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'events/' });
    return Response.json({ urls: blobs.map(b => b.url) });
  } catch (err) {
    console.error('Images list failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
