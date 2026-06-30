import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const dir = 'public/meditierenden';
const files = (await readdir(dir)).filter(f => f.endsWith('.jpg'));

for (const file of files) {
  const src = join(dir, file);
  const dest = join(dir, file.replace('.jpg', '.webp'));
  const { width, size: srcSize } = await sharp(src).metadata();
  await sharp(src)
    .resize({ width: Math.min(width, 900) })
    .webp({ quality: 80 })
    .toFile(dest);
  const { size: destSize } = await sharp(dest).metadata();
  console.log(`${file} → ${file.replace('.jpg', '.webp')}  (${Math.round(srcSize/1024)}KB → ${Math.round(destSize/1024)}KB)`);
}
