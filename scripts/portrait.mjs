// Builds responsive AVIF + WebP copies of the hero photo from the original
// image the owner supplied, which is never modified (resize + re-encode only: no crop, no
// retouching, no colour changes). Run: npm run portrait
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/img/Gemini_Generated_Image_qfcs7sqfcs7sqfcs.png";
const OUT_DIR = "public/img/portrait";
const WIDTHS = [640, 1024, 1376];

mkdirSync(OUT_DIR, { recursive: true });
const { width, height } = await sharp(SOURCE).metadata();
for (const w of WIDTHS.filter((w) => w <= width)) {
  const resized = sharp(SOURCE).resize({ width: w, withoutEnlargement: true });
  const avif = await resized.clone().avif({ quality: 60, effort: 6 }).toFile(`${OUT_DIR}/hero-${w}.avif`);
  const webp = await resized.clone().webp({ quality: 82 }).toFile(`${OUT_DIR}/hero-${w}.webp`);
  console.log(`hero-${w}: ${avif.width}x${avif.height}  avif ${(avif.size / 1024).toFixed(0)} KB, webp ${(webp.size / 1024).toFixed(0)} KB`);
}
console.log(`source ${SOURCE} ${width}x${height} (unchanged)`);
