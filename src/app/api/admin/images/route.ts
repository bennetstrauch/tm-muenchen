import { list } from '@vercel/blob';

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
