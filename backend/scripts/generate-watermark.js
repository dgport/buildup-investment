/**
 * Renders the photo watermark assets from the brand mark.
 *
 *   node scripts/generate-watermark.js
 *
 * Output (committed to git, loaded at upload time):
 *   assets/watermark/center.png  – logo + "BuildUp", placed in the middle of a photo
 *   assets/watermark/corner.png  – small "buildup.ge", placed bottom-right
 *
 * The text is rendered here, once, instead of at upload time: the production
 * image is Alpine Linux without fonts, where SVG text would not render.
 */
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "assets", "watermark");
const LOGO = path.join(__dirname, "..", "..", "frontend", "public", "Logo.png");

/** White silhouette of the gold bar-chart mark, as a data URI for the SVG. */
async function whiteLogo(height) {
  const trimmed = await sharp(LOGO).trim().resize({ height }).ensureAlpha().toBuffer();
  const { width } = await sharp(trimmed).metadata();
  const alpha = await sharp(trimmed).extractChannel("alpha").toBuffer();
  const png = await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();
  return { uri: `data:image/png;base64,${png.toString("base64")}`, width };
}

/**
 * SVG filter: a tight dark halo plus a wide soft shadow under the white shapes,
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

async function center() {
  const H = 300;
  const logo = await whiteLogo(H);
  const gap = 36;
  const fontSize = 230;
  // Width of "BuildUp" at this size, measured once for Arial Bold (~0.6em per glyph avg)
  const textWidth = Math.round(fontSize * 3.72);
  const pad = 40;
  const W = pad + logo.width + gap + textWidth + pad;
  const canvasH = H + pad * 2;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${canvasH}">
  <defs>${shadow(1)}</defs>
  <g opacity="0.7" filter="url(#s)">
    <image href="${logo.uri}" x="${pad}" y="${pad}" width="${logo.width}" height="${H}"/>
    <text x="${pad + logo.width + gap}" y="${pad + H * 0.8}"
          font-family="Arial, Helvetica, sans-serif" font-weight="700"
          font-size="${fontSize}" letter-spacing="-4" fill="#ffffff">BuildUp</text>
  </g>
</svg>`;
  await sharp(Buffer.from(svg)).png().trim({ threshold: 0 }).toFile(path.join(OUT, "center.png"));
}

async function corner() {
  const H = 64;
  const logo = await whiteLogo(H);
  const fontSize = 58;
  const pad = 16;
  const gap = 12;
  const textWidth = Math.round(fontSize * 5.4);
  const W = pad + logo.width + gap + textWidth + pad;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + pad * 2}">
  <defs>${shadow(0.5)}</defs>
  <g opacity="0.85" filter="url(#s)">
    <image href="${logo.uri}" x="${pad}" y="${pad}" width="${logo.width}" height="${H}"/>
    <text x="${pad + logo.width + gap}" y="${pad + H * 0.82}"
          font-family="Arial, Helvetica, sans-serif" font-weight="700"
          font-size="${fontSize}" fill="#ffffff">buildup.ge</text>
  </g>
</svg>`;
  await sharp(Buffer.from(svg)).png().trim({ threshold: 0 }).toFile(path.join(OUT, "corner.png"));
}

(async () => {
  await fs.mkdir(OUT, { recursive: true });
  await center();
  await corner();
  for (const f of ["center.png", "corner.png"]) {
    const m = await sharp(path.join(OUT, f)).metadata();
    console.log(`${f}: ${m.width}x${m.height}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
