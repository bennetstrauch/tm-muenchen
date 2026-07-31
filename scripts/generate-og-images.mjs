import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

// Link-preview crops: 1200×630 JPG, the OG standard aspect (1.91:1).
// Sources are the existing category photos + the retreat photo for /events.
const OUT_DIR = 'public/og';

const JOBS = [
  { src: 'public/retreat-gruss.jpg', out: 'events.jpg' },
  { src: 'public/meditierenden/ueberpruefung.jpg', out: 'checking.jpg' },
  { src: 'public/meditierenden/vertiefung.jpg', out: 'wochenende.jpg' },
  { src: 'public/meditierenden/treffen.jpg', out: 'treffen.jpg' },
  { src: 'public/meditierenden/fortgeschritten.jpg', out: 'fortgeschritten.jpg', position: 'right' },
];

await mkdir(OUT_DIR, { recursive: true });

for (const { src, out, position } of JOBS) {
  const dest = `${OUT_DIR}/${out}`;
  await sharp(src)
    .resize(1200, 630, { fit: 'cover', position: position ?? 'centre' })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(dest);
  const { size } = await stat(dest);
  console.log(`${src} → ${dest}  (${Math.round(size / 1024)}KB)`);
}
