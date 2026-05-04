import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return Response.json({ error: 'Keine Datei.' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
    }

    const blob = await put(`events/${Date.now()}-${file.name}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  } catch (err) {
    console.error('Image upload failed:', err);
    return Response.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
  }
}
