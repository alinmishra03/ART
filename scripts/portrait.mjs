// Builds responsive AVIF + WebP copies of the hero photo from the original
// image the owner supplied, which is never modified (resize + re-encode only: no crop,
// no colour changes). The original is 1376px wide, so the two larger sizes for
// wide and high-density screens are Lanczos upscales with a light unsharp mask to
// keep edges crisp. Run: npm run portrait
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/img/Gemini_Generated_Image_qfcs7sqfcs7sqfcs.png";
const OUT_DIR = "public/img/portrait";
const WIDTHS = [640, 1024, 1376, 1920, 2752];

mkdirSync(OUT_DIR, { recursive: true });
const { width, height } = await sharp(SOURCE).metadata();
for (const w of WIDTHS) {
  let resized = sharp(SOURCE).resize({ width: w, kernel: "lanczos3" });
  if (w > width) resized = resized.sharpen({ sigma: 0.8, m1: 0.6, m2: 1.4 });
  const avif = await resized.clone().avif({ quality: 72, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`${OUT_DIR}/hero-${w}.avif`);
  const webp = await resized.clone().webp({ quality: 90, smartSubsample: true }).toFile(`${OUT_DIR}/hero-${w}.webp`);
  console.log(`hero-${w}: ${avif.width}x${avif.height}  avif ${(avif.size / 1024).toFixed(0)} KB, webp ${(webp.size / 1024).toFixed(0)} KB`);
}
console.log(`source ${SOURCE} ${width}x${height} (unchanged)`);
