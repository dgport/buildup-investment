import { promises as fs } from 'fs';
import path from 'path';
import { UPLOADS_ROOT } from '../config/multer.config';

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
