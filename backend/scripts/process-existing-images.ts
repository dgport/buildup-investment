/**
 * Re-process photos that are already uploaded: resize, thumbnail and — for
 * listings and projects — the BuildUp watermark.
 *
 *   npx ts-node -r tsconfig-paths/register scripts/process-existing-images.ts
 *
 * Safe to run any number of times, e.g. after changing the watermark design:
 * - a photo with a saved original is always re-rendered FROM that original,
 *   so the watermark is never applied twice;
 * - a photo without one (uploaded before watermarking existed) first has its
 *   current file saved as the original, then gets watermarked.
 * File names never change, so URLs stored in the database stay valid.
 * Developer logos are only resized, never watermarked.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { UPLOADS_ROOT } from '../src/common/config/multer.config';
import { FileUtils, THUMB_SUFFIX } from '../src/common/utils/file.utils';

const WATERMARKED_FOLDERS = new Set(['properties', 'projects']);

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: import('fs').Dirent[];
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

async function main() {
  let processed = 0;
  let watermarked = 0;
  let skipped = 0;

  for await (const file of walk(UPLOADS_ROOT)) {
    const base = path.basename(file, path.extname(file));
    if (base.endsWith(THUMB_SUFFIX)) continue;

    const format = FileUtils.formatForExtension(file);
    if (!format) {
      skipped += 1;
      console.warn(`skip (unsupported extension): ${path.relative(UPLOADS_ROOT, file)}`);
      continue;
    }

    const folder = path.relative(UPLOADS_ROOT, file).split(path.sep)[0];
    const watermark = WATERMARKED_FOLDERS.has(folder);

    try {
      const source = (await FileUtils.readOriginal(file)) ?? (await fs.readFile(file));
      const rendered = await FileUtils.renderImage(source, { watermark, format });
      await FileUtils.writeImageSet(file, rendered, { watermark });
      processed += 1;
      if (watermark) watermarked += 1;
    } catch (error) {
      skipped += 1;
      console.warn(`skip ${path.relative(UPLOADS_ROOT, file)}: ${(error as Error).message}`);
    }
  }

  console.log(`processed ${processed} photo(s), watermarked ${watermarked}, skipped ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
