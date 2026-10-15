import fs from "fs";
import path from "path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp Vector SVG for Pizza Nova
const createSvgIcon = (isMaskable = false) => {
  const padding = isMaskable ? 80 : 20;
  const viewBoxSize = 512;
  const contentSize = viewBoxSize - padding * 2;
  const offset = padding;

  return `
<svg width="${viewBoxSize}" height="${viewBoxSize}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#2a201b"/>
      <stop offset="50%" stop-color="#181310"/>
      <stop offset="100%" stop-color="#0d0a08"/>
    </radialGradient>

    <!-- Outer Ring Glow -->
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>

    <!-- Pizza Crust Gradient -->
    <linearGradient id="crustGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <!-- Melted Cheese Gradient -->
    <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>

    <!-- Tomato Sauce Gradient -->
    <linearGradient id="sauceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>

    <!-- Pepperoni Gradient -->
    <radialGradient id="pepGrad" cx="40%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>

    <!-- Shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" rx="${isMaskable ? "0" : "110"}"/>

  <g transform="translate(${offset}, ${offset}) scale(${contentSize / 512})">
    <!-- Outer Glow Ring -->
    <circle cx="256" cy="256" r="230" fill="none" stroke="url(#goldGlow)" stroke-width="6" opacity="0.4" stroke-dasharray="16 8"/>
    
    <!-- Stone Hearth Circular Plate -->
    <circle cx="256" cy="256" r="210" fill="#1d1714" stroke="#33241d" stroke-width="4" filter="url(#shadow)"/>

    <!-- Pizza Slice Group -->
    <g filter="url(#shadow)">
      <!-- Pizza Crust (Top Arc) -->
      <path d="M 120 140 C 200 95, 312 95, 392 140 C 375 165, 355 170, 340 162 C 325 155, 310 168, 290 160 C 270 152, 242 165, 222 155 C 202 145, 180 162, 160 152 C 145 145, 130 155, 120 140 Z" fill="url(#crustGrad)" />
      
      <!-- Red Rich Marinara Base -->
      <path d="M 132 155 Q 256 125 380 155 L 256 410 Z" fill="url(#sauceGrad)" />

      <!-- Melted Golden Mozzarella Cheese Layer -->
      <path d="M 142 165 C 200 140, 312 140, 370 165 L 256 395 Z" fill="url(#cheeseGrad)" />

      <!-- Drip cheese detail -->
      <path d="M 230 310 C 240 330, 245 350, 256 395 C 265 350, 272 330, 282 310 Z" fill="#fef08a" opacity="0.9" />

      <!-- Pepperoni Slices -->
      <circle cx="205" cy="205" r="26" fill="url(#pepGrad)" stroke="#7f1d1d" stroke-width="2"/>
      <circle cx="305" cy="210" r="28" fill="url(#pepGrad)" stroke="#7f1d1d" stroke-width="2"/>
      <circle cx="256" cy="285" r="24" fill="url(#pepGrad)" stroke="#7f1d1d" stroke-width="2"/>

      <!-- Pepperoni Herb flecks -->
      <circle cx="200" cy="200" r="2.5" fill="#fef08a" opacity="0.7"/>
      <circle cx="210" cy="212" r="2" fill="#450a0a" opacity="0.8"/>
      <circle cx="300" cy="205" r="3" fill="#fef08a" opacity="0.7"/>
      <circle cx="312" cy="218" r="2.5" fill="#450a0a" opacity="0.8"/>
      <circle cx="252" cy="280" r="2" fill="#fef08a" opacity="0.7"/>

      <!-- Fresh Basil Leaves -->
      <path d="M 235 235 C 220 220, 215 240, 235 255 C 255 240, 250 220, 235 235 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5" />
      <path d="M 285 250 C 275 240, 270 252, 285 264 C 300 252, 295 240, 285 250 Z" fill="#16a34a" stroke="#14532d" stroke-width="1.5" />
    </g>

    <!-- Traditional Oven Flame Embers Accent at base -->
    <path d="M 220 445 C 240 430, 250 435, 256 425 C 262 435, 272 430, 292 445 C 275 455, 235 455, 220 445 Z" fill="url(#goldGlow)" opacity="0.8" />

    <!-- 66 Brand Badge Small -->
    <circle cx="256" cy="460" r="18" fill="#ea580c" stroke="#f59e0b" stroke-width="2"/>
    <text x="256" y="466" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">66</text>
  </g>
</svg>
`;
};

async function generateAllIcons() {
  console.log("Generating modern PWA icon set for Pizza Nova...");

  const svgStandard = createSvgIcon(false);
  const svgMaskable = createSvgIcon(true);

  // 1. Save standard SVG
  fs.writeFileSync(path.join(publicDir, "icon.svg"), svgStandard);

  // 2. Generate 192x192 PNG
  await sharp(Buffer.from(svgStandard))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("✓ Generated /public/icon-192.png (192x192)");

  // 3. Generate 512x512 PNG
  await sharp(Buffer.from(svgStandard))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("✓ Generated /public/icon-512.png (512x512)");

  // 4. Generate 512x512 Maskable PNG with Safe Zone
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "icon-maskable.png"));
  console.log("✓ Generated /public/icon-maskable.png (512x512 Maskable)");

  // 5. Generate Apple Touch Icon 180x180 PNG
  await sharp(Buffer.from(svgStandard))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("✓ Generated /public/apple-touch-icon.png (180x180)");

  // 6. Generate Favicon 64x64 PNG
  await sharp(Buffer.from(svgStandard))
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "favicon.png"));
  console.log("✓ Generated /public/favicon.png (64x64)");

  console.log("All PWA icons generated successfully!");
}

generateAllIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
