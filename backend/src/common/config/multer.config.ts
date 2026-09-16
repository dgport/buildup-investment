import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

/** Absolute folder where every upload is stored: <cwd>/public/uploads */
export const UPLOADS_ROOT = join(process.cwd(), 'public', 'uploads');

/**
 * Un-watermarked copies of watermarked photos: <cwd>/storage/originals.
 * Never served over HTTP; lets the watermark be re-rendered later.
 */
export const ORIGINALS_ROOT = join(process.cwd(), 'storage', 'originals');

/** Pre-rendered watermark PNGs (see scripts/generate-watermark.js). */
export const WATERMARK_DIR = join(process.cwd(), 'assets', 'watermark');

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGES_PER_REQUEST = 20;

const ALLOWED_MIME = /^image\/(jpe?g|png|gif|webp|avif|heic|heif)$/i;

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const uploadPath = join(UPLOADS_ROOT, folder);

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const shortUuid = uuidv4().substring(0, 8);
      const timestamp = Date.now();
      const ext = (extname(file.originalname) || '.jpg').toLowerCase();
      cb(null, `${timestamp}-${shortUuid}${ext}`);
    },
  }),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (ALLOWED_MIME.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only image files are allowed (jpg, png, gif, webp, avif, heic)',
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGES_PER_REQUEST,
  },
});
