/**
 * One-off backfill: re-encode photos uploaded before the optimizer existed and
 * generate their thumbnails. Safe to run repeatedly.
 *
 *   node scripts/optimize-existing-images.js
 */
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_EDGE = 1920;
const THUMB_EDGE = 640;

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

(async () => {
  let done = 0;
  let skipped = 0;
  let saved = 0;

  for await (const file of walk(ROOT)) {
    const ext = path.extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif"].includes(ext)) continue;

    const base = path.basename(file, path.extname(file));
    if (base.endsWith("_t")) continue; // already a thumbnail

    const dir = path.dirname(file);
    const thumb = path.join(dir, `${base}_t.jpg`);
    const hasThumb = await fs
      .access(thumb)
      .then(() => true)
      .catch(() => false);

    try {
      const source = await fs.readFile(file);
      const before = source.length;
      const pipeline = sharp(source, { failOn: "none" }).rotate();
      const { format } = await pipeline.metadata();
      const keepsFormat = format === "png" || format === "webp";
      const targetExt = keepsFormat ? path.extname(file) : ".jpg";

      const resized = pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
      const optimized = await (keepsFormat
        ? format === "png"
          ? resized.png({ compressionLevel: 9, palette: true })
          : resized.webp({ quality: 82 })
        : resized.jpeg({ quality: 82, mozjpeg: true })
      ).toBuffer();

      // Only replace when it actually helps and the extension stays the same.
      const mainPath = path.join(dir, base + targetExt);
      if (mainPath === file && optimized.length < before) {
        await fs.writeFile(file, optimized);
        saved += before - optimized.length;
      }

      if (!hasThumb) {
        await sharp(optimized)
          .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 76, mozjpeg: true })
          .toFile(thumb);
      }
      done += 1;
    } catch (error) {
      skipped += 1;
      console.warn(`skip ${path.basename(file)}: ${error.message}`);
    }
  }

  console.log(
    `optimized ${done} image(s), skipped ${skipped}, saved ${(saved / 1024).toFixed(0)} KB`,
  );
})();
