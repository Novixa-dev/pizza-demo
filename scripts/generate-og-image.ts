import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Builds public/og-image.jpg, the 1200x630 card shown when the demo is shared.
 * Run `scripts/generate-icons.ts` first: the pizza mark is composited from
 * public/icon-512.png so the card and the PWA icon always match.
 */
const publicDir = path.join(process.cwd(), "public");
const WIDTH = 1200;
const HEIGHT = 630;
const FONT = "'Segoe UI', Tahoma, 'Noto Sans Arabic', Arial, sans-serif";

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="25%" cy="45%" r="85%">
      <stop offset="0%" stop-color="#2a201b"/>
      <stop offset="55%" stop-color="#181310"/>
      <stop offset="100%" stop-color="#0d0a08"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="270" cy="315" r="230" fill="none" stroke="#f59e0b" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="14 10"/>

  <!-- Demo badge -->
  <rect x="640" y="70" width="470" height="52" rx="26" fill="#f59e0b" fill-opacity="0.14" stroke="#f59e0b" stroke-opacity="0.5"/>
  <text x="875" y="105" font-family="${FONT}" font-size="26" font-weight="700" fill="#fcd34d" text-anchor="middle" direction="rtl">نسخة عرض · Novixa Restaurant</text>

  <!-- Title. In RTL runs the renderer's "start" anchor is the right edge, so
       Arabic lines use text-anchor="start" at the right margin (x=1110). -->
  <text x="1110" y="250" font-family="${FONT}" font-size="118" font-weight="800" fill="#fcd34d" text-anchor="start" direction="rtl">بيتزا نوڤا</text>
  <text x="1110" y="310" font-family="${FONT}" font-size="36" font-weight="600" fill="#f5f5f4" text-anchor="end">Pizza Nova – Novixa Restaurant demo</text>

  <!-- Value line -->
  <text x="1110" y="392" font-family="${FONT}" font-size="31" fill="#d6d3d1" text-anchor="start" direction="rtl">اطلب مسبقاً، حدّد وقت الاستلام، وادفع محلياً</text>

  <!-- Payment pill -->
  <rect x="690" y="440" width="420" height="64" rx="32" fill="#1c1917" stroke="#f59e0b" stroke-opacity="0.45"/>
  <text x="900" y="482" font-family="${FONT}" font-size="30" fill="#fcd34d" text-anchor="middle" direction="rtl">كريمي · العمقي · البسيري · نقداً</text>

  <text x="1110" y="580" font-family="${FONT}" font-size="26" fill="#a8a29e" text-anchor="end">novixa.dev</text>
</svg>`;

async function main() {
  const icon = await sharp(path.join(publicDir, "icon-512.png")).resize(330, 330).toBuffer();
  await sharp(Buffer.from(svg))
    .composite([{ input: icon, left: 105, top: 150 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, "og-image.jpg"));
  const { size } = fs.statSync(path.join(publicDir, "og-image.jpg"));
  console.log(`✓ Generated /public/og-image.jpg (${WIDTH}x${HEIGHT}, ${Math.round(size / 1024)} KB)`);
}

main().catch((err) => {
  console.error("Error generating og-image:", err);
  process.exit(1);
});
