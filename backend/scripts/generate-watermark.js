/**
 * Renders the photo watermark assets.
 *
 *   node scripts/generate-watermark.js
 *
 * Output (committed to git, loaded at upload time):
 *   assets/watermark/center.png  – "BuildUp.ge", placed in the middle of a photo
 *   assets/watermark/corner.png  – small "buildup.ge", placed bottom-right
 *
 * Text only, no logo: the site address tells anyone who sees a reposted photo
 * where it came from. The text is rendered here, once, instead of at upload
 * time: the production image is Alpine Linux without fonts, where SVG text
 * would not render.
 *
 * After changing the artwork, re-render existing photos from their originals:
 *   npx ts-node -r tsconfig-paths/register scripts/process-existing-images.ts
 */
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "assets", "watermark");

/**
 * SVG filter: a tight dark halo plus a wide soft shadow under the white text,
 * so the mark stays readable on white walls and sky as well as on dark rooms.
 */
const shadow = (scale) => `
  <filter id="s" x="-20%" y="-50%" width="140%" height="200%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${2 * scale}" result="tightBlur"/>
    <feComponentTransfer in="tightBlur" result="tight"><feFuncA type="linear" slope="0.85"/></feComponentTransfer>
    <feGaussianBlur in="SourceAlpha" stdDeviation="${9 * scale}" result="wideBlur"/>
    <feOffset in="wideBlur" dy="${2 * scale}" result="wideOffset"/>
    <feComponentTransfer in="wideOffset" result="wide"><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
    <feMerge><feMergeNode in="wide"/><feMergeNode in="tight"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

/**
 * White bold text with shadow on a transparent canvas, trimmed to its bounds.
 * The canvas is deliberately oversized; trimming removes the empty space.
 */
async function renderText({ text, fontSize, opacity, shadowScale, letterSpacing = 0, file }) {
  const pad = Math.round(fontSize * 0.4);
  const width = Math.round(fontSize * text.length * 0.75) + pad * 2;
  const height = Math.round(fontSize * 1.5) + pad * 2;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>${shadow(shadowScale)}</defs>
  <g opacity="${opacity}" filter="url(#s)">
    <text x="${pad}" y="${pad + fontSize}"
          font-family="Arial, Helvetica, sans-serif" font-weight="700"
          font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="#ffffff">${text}</text>
  </g>
</svg>`;
  await sharp(Buffer.from(svg)).png().trim({ threshold: 0 }).toFile(path.join(OUT, file));
}

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  await renderText({
    text: "BuildUp.ge",
    fontSize: 230,
    opacity: 0.7,
    shadowScale: 1,
    letterSpacing: -4,
    file: "center.png",
  });
  await renderText({
    text: "buildup.ge",
    fontSize: 58,
    opacity: 0.85,
    shadowScale: 0.5,
    file: "corner.png",
  });
  for (const f of ["center.png", "corner.png"]) {
    const m = await sharp(path.join(OUT, f)).metadata();
    console.log(`${f}: ${m.width}x${m.height}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
