import { promises as fs } from 'fs';
import path from 'path';
import { UPLOADS_ROOT } from '../config/multer.config';

/** Magic-number signatures of the image formats we accept. */
const IMAGE_SIGNATURES: { name: string; test: (b: Buffer) => boolean }[] = [
  { name: 'jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    name: 'png',
    test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  { name: 'gif', test: (b) => b.subarray(0, 4).toString('ascii') === 'GIF8' },
  {
    name: 'webp',
    test: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    // ISO base media (avif / heic / heif): "....ftyp" followed by a brand
    name: 'isobmff',
    test: (b) => b.subarray(4, 8).toString('ascii') === 'ftyp',
  },
];

export class FileUtils {
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
    const cleanPath = relativePath.replace(/^\/+/, '').replace(/^uploads\//, '');
    const fullPath = path.resolve(UPLOADS_ROOT, cleanPath);

    if (!fullPath.startsWith(UPLOADS_ROOT)) return;

    try {
      await fs.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`⚠️ Failed to delete file: ${fullPath}`, err.message);
      }
    }
  }
}
