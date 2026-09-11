import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Logger } from '@nestjs/common';
import { UPLOADS_ROOT } from '../config/multer.config';

/** Longest edge of the stored "full size" image. */
const MAX_EDGE = 1920;
/** Longest edge of the generated thumbnail (cards, tables, map popups). */
const THUMB_EDGE = 640;
/** Suffix of the generated thumbnail: photo.jpg → photo_t.jpg */
export const THUMB_SUFFIX = '_t';

/** Magic-number signatures of the image formats we accept. */
const IMAGE_SIGNATURES: { name: string; test: (b: Buffer) => boolean }[] = [
  {
    name: 'jpeg',
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    name: 'png',
    test: (b) =>
      b
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  { name: 'gif', test: (b) => b.subarray(0, 4).toString('ascii') === 'GIF8' },
  {
    name: 'webp',
    test: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    // ISO base media (avif / heic / heif): "....ftyp" followed by a brand
    name: 'isobmff',
    test: (b) => b.subarray(4, 8).toString('ascii') === 'ftyp',
  },
];

export class FileUtils {
  private static readonly logger = new Logger(FileUtils.name);

  /**
   * Rewrite an uploaded photo as a web-sized image and generate a thumbnail
   * next to it. Phone photos arrive at 4000px / several MB and would otherwise
   * be downloaded at full size by every listing card.
   *
   * - EXIF orientation is applied, so sideways phone photos come out upright
   * - the longest edge is capped at 1920px (thumbnail 640px)
   * - HEIC/AVIF are converted to JPEG (`file.filename` is updated accordingly)
   *
   * Any failure leaves the original file untouched — an unoptimised photo is
   * better than a failed upload.
   */
  static async optimizeImages(
    files: Express.Multer.File[] | undefined,
  ): Promise<Express.Multer.File[]> {
    for (const file of files ?? []) {
      try {
        await FileUtils.optimizeImage(file);
      } catch (error) {
        FileUtils.logger.warn(
          `Could not optimize ${file.filename}: ${(error as Error).message}`,
        );
      }
    }
    return files ?? [];
  }

  private static async optimizeImage(file: Express.Multer.File) {
    // Read into memory first: opening the same path sharp is about to write
    // (and files the static server may be serving) is unreliable on Windows.
    const source = await fs.readFile(file.path);
    const pipeline = sharp(source, { failOn: 'none' }).rotate();
    const { format } = await pipeline.metadata();

    // Formats browsers cannot display everywhere are re-encoded as JPEG.
    const keepsFormat = format === 'png' || format === 'webp';
    const targetExt = keepsFormat ? path.extname(file.path) : '.jpg';

    const resized = pipeline.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const optimized = await (
      keepsFormat
        ? format === 'png'
          ? resized.png({ compressionLevel: 9, palette: true })
          : resized.webp({ quality: 82 })
        : resized.jpeg({ quality: 82, mozjpeg: true })
    ).toBuffer();

    const dir = path.dirname(file.path);
    const base = path.basename(file.path, path.extname(file.path));
    const mainPath = path.join(dir, base + targetExt);

    await fs.writeFile(mainPath, optimized);
    if (mainPath !== file.path) {
      await fs.unlink(file.path).catch(() => undefined);
      file.filename = base + targetExt;
      file.path = mainPath;
    }
    file.size = optimized.length;

    // Thumbnail is always JPEG – it is only ever shown small.
    await sharp(optimized)
      .resize({
        width: THUMB_EDGE,
        height: THUMB_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 76, mozjpeg: true })
      .toFile(path.join(dir, base + THUMB_SUFFIX + '.jpg'));
  }

  /**
   * Relative URL (without leading slash) that the API serves the file under,
   * e.g. `uploads/properties/1700000000-abcd1234.jpg`.
   */
  static generateImageUrl(
    file: Express.Multer.File | undefined,
    folder: string,
  ): string | null {
    if (!file || !file.filename) {
      return null;
    }

    return `uploads/${folder}/${file.filename}`;
  }

  /**
   * Multer only sees the client-supplied MIME type. Read the first bytes of
   * the stored file and verify it really is an image; delete it otherwise.
   * Returns the files that passed.
   */
  static async keepOnlyRealImages(
    files: Express.Multer.File[] | undefined,
  ): Promise<Express.Multer.File[]> {
    if (!files?.length) return [];
    const kept: Express.Multer.File[] = [];
    for (const file of files) {
      if (await FileUtils.isImageFile(file.path)) {
        kept.push(file);
      } else {
        await fs.unlink(file.path).catch(() => undefined);
      }
    }
    return kept;
  }

  static async isImageFile(filePath: string): Promise<boolean> {
    let handle: fs.FileHandle | undefined;
    try {
      handle = await fs.open(filePath, 'r');
      const header = Buffer.alloc(16);
      const { bytesRead } = await handle.read(header, 0, 16, 0);
      if (bytesRead < 12) return false;
      return IMAGE_SIGNATURES.some((s) => s.test(header));
    } catch {
      return false;
    } finally {
      await handle?.close();
    }
  }

  static async deleteFile(relativePath: string) {
    if (!relativePath) return;

    // Stored URLs look like "uploads/<folder>/<file>"; strip the prefix and
    // resolve inside the uploads root so nothing outside it can be touched.
    const cleanPath = relativePath
      .replace(/^\/+/, '')
      .replace(/^uploads\//, '');
    const fullPath = path.resolve(UPLOADS_ROOT, cleanPath);

    if (!fullPath.startsWith(UPLOADS_ROOT)) return;

    const thumbPath = path.join(
      path.dirname(fullPath),
      path.basename(fullPath, path.extname(fullPath)) + THUMB_SUFFIX + '.jpg',
    );

    for (const target of [fullPath, thumbPath]) {
      try {
        await fs.unlink(target);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== 'ENOENT') {
          FileUtils.logger.warn(
            `Failed to delete file ${target}: ${(err as Error).message}`,
          );
        }
      }
    }
  }
}
