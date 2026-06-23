import { put } from '@vercel/blob';
import sharp from 'sharp';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

export const dynamic = 'force-dynamic';

const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 82;

async function resolveFolder(prefix: string | null): Promise<string> {
  if (prefix === 'center') {
    const tenant = await getCurrentTenant();
    return `center/${tenant.tenant}`;
  }
  return 'events';
}

export async function POST(request: Request) {
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return Response.json({ error: 'Keine Datei.' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: 'Nur Bilder erlaubt.' }, { status: 400 });
    }

    const prefix = formData.get('prefix') as string | null;
    const folder = await resolveFolder(prefix);

    const buffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const blob = await put(`${folder}/${Date.now()}-${baseName}.webp`, resized, {
      access: 'public',
      contentType: 'image/webp',
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    console.error('Image upload failed:', err);
    return Response.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 });
  }
}
