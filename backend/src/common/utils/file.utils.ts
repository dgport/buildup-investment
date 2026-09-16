import { promises as fs } from 'fs';
import path from 'path';
import sharp, { type OverlayOptions, type Sharp } from 'sharp';
import { Logger } from '@nestjs/common';
import {
  ORIGINALS_ROOT,
  UPLOADS_ROOT,
  WATERMARK_DIR,
} from '../config/multer.config';

/** Longest edge of the stored "full size" image. */
const MAX_EDGE = 1920;
/** Longest edge of the generated thumbnail (cards, tables, map popups). */
const THUMB_EDGE = 640;
/** Suffix of the generated thumbnail: photo.jpg → photo_t.jpg */
export const THUMB_SUFFIX = '_t';

type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface ProcessOptions {
  /** Burn the BuildUp mark into the photo and keep a clean original. */
  watermark?: boolean;
}

export interface RenderedImage {
  format: OutputFormat;
  /** Resized, auto-rotated photo without watermark. */
  clean: Buffer;
  /** What the public URL serves (watermarked when requested). */
  public: Buffer;
  /** 640px JPEG made from `public`. */
  thumb: Buffer;
}

interface WatermarkAssets {
  center: Buffer;
  /** height / width of center.png */
  centerRatio: number;
  corner: Buffer;
  cornerRatio: number;
}

const EXT_BY_FORMAT: Record<OutputFormat, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
};

const FORMAT_BY_EXT: Record<string, OutputFormat> = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
};

const exists = (p: string) =>
  fs
    .access(p)
    .then(() => true)
    .catch(() => false);

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

  private static watermarkAssets?: Promise<WatermarkAssets | null>;

  /**
   * Rewrite uploaded photos for the web and generate thumbnails next to them.
   * Phone photos arrive at 4000px / several MB and would otherwise be
   * downloaded at full size by every listing card.
   *
   * - EXIF orientation is applied, so sideways phone photos come out upright
   * - the longest edge is capped at 1920px (thumbnail 640px)
   * - HEIC/AVIF/GIF become JPEG (`file.filename` is updated accordingly)
   * - with `watermark`, the BuildUp mark is burned into the served photo and
   *   the clean version is kept in storage/originals (never served)
   *
   * A failure leaves the uploaded file untouched — an unprocessed photo is
   * better than a failed upload.
   */
  static async optimizeImages(
    files: Express.Multer.File[] | undefined,
    options: ProcessOptions = {},
  ): Promise<Express.Multer.File[]> {
    for (const file of files ?? []) {
      try {
        await FileUtils.processUpload(file, options);
      } catch (error) {
        FileUtils.logger.warn(
          `Could not process ${file.filename}: ${(error as Error).message}`,
        );
      }
    }
    return files ?? [];
  }

  private static async processUpload(
    file: Express.Multer.File,
    options: ProcessOptions,
  ) {
    // Read into memory first: opening a path sharp is about to overwrite (or
    // one the static server may be serving) is unreliable on Windows.
    const source = await fs.readFile(file.path);
    const rendered = await FileUtils.renderImage(source, options);

    const dir = path.dirname(file.path);
    const base = path.basename(file.path, path.extname(file.path));
    const publicPath = path.join(dir, base + EXT_BY_FORMAT[rendered.format]);

    await FileUtils.writeImageSet(publicPath, rendered, options);
    if (publicPath !== file.path) {
      await fs.unlink(file.path).catch(() => undefined);
      file.filename = path.basename(publicPath);
      file.path = publicPath;
    }
    file.size = rendered.public.length;
  }

  /**
   * Resize/rotate a photo, optionally watermark it, and build its thumbnail.
   * `format` forces the output encoding (used when re-processing a file whose
   * URL — and therefore extension — must not change).
   */
  static async renderImage(
    source: Buffer,
    options: ProcessOptions & { format?: OutputFormat } = {},
  ): Promise<RenderedImage> {
    const { format: sourceFormat } = await sharp(source, {
      failOn: 'none',
    }).metadata();
    const format: OutputFormat =
      options.format ??
      (sourceFormat === 'png' || sourceFormat === 'webp'
        ? sourceFormat
        : 'jpeg');

    // Decode once to raw pixels so the clean and the watermarked versions
    // are each encoded a single time (no double JPEG compression).
    const { data, info } = await sharp(source, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const raw = () =>
      sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels,
        },
      });

    const clean = await FileUtils.encode(raw(), format).toBuffer();

    const layers = options.watermark
      ? await FileUtils.watermarkLayers(info.width, info.height)
      : [];
    const publicBuffer = layers.length
      ? await FileUtils.encode(raw().composite(layers), format).toBuffer()
      : clean;

    const thumb = await sharp(publicBuffer)
      .resize({
        width: THUMB_EDGE,
        height: THUMB_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 76, mozjpeg: true })
      .toBuffer();

    return { format, clean, public: publicBuffer, thumb };
  }

  /** Write the served photo, its thumbnail and (when watermarked) the original. */
  static async writeImageSet(
    publicPath: string,
    rendered: RenderedImage,
    options: ProcessOptions,
  ) {
    const rel = path.relative(UPLOADS_ROOT, publicPath);
    if (options.watermark && !rel.startsWith('..')) {
      // Original first: a watermarked public file must always have one.
      const originalPath = path.join(ORIGINALS_ROOT, rel);
      await fs.mkdir(path.dirname(originalPath), { recursive: true });
      await fs.writeFile(originalPath, rendered.clean);
    }
    await fs.writeFile(publicPath, rendered.public);
    await fs.writeFile(FileUtils.thumbnailPath(publicPath), rendered.thumb);
  }

  /** Clean copy kept for a public upload path, if one exists. */
  static async readOriginal(publicPath: string): Promise<Buffer | null> {
    const rel = path.relative(UPLOADS_ROOT, publicPath);
    if (rel.startsWith('..')) return null;
    const originalPath = path.join(ORIGINALS_ROOT, rel);
    return (await exists(originalPath)) ? fs.readFile(originalPath) : null;
  }

  static formatForExtension(filePath: string): OutputFormat | null {
    return FORMAT_BY_EXT[path.extname(filePath).toLowerCase()] ?? null;
  }

  static thumbnailPath(publicPath: string) {
    return path.join(
      path.dirname(publicPath),
      path.basename(publicPath, path.extname(publicPath)) +
        THUMB_SUFFIX +
        '.jpg',
    );
  }

  private static encode(image: Sharp, format: OutputFormat) {
    switch (format) {
      case 'png':
        return image.png({ compressionLevel: 9, palette: true });
      case 'webp':
        return image.webp({ quality: 82 });
      default:
        return image
          .flatten({ background: '#ffffff' })
          .jpeg({ quality: 82, mozjpeg: true });
    }
  }

  /**
   * Centered logo mark (~42% of the width) plus a small "buildup.ge" in the
   * bottom-right corner — two marks are much harder to crop out than one.
   */
  private static async watermarkLayers(
    width: number,
    height: number,
  ): Promise<OverlayOptions[]> {
    const assets = await FileUtils.loadWatermark();
    if (!assets || width < 120 || height < 80) return [];

    const layers: OverlayOptions[] = [];

    const centerWidth = Math.floor(
      Math.min(
        Math.max(width * 0.42, 160),
        width * 0.85,
        (height * 0.8) / assets.centerRatio,
      ),
    );
    layers.push({
      input: await sharp(assets.center)
        .resize({ width: centerWidth })
        .toBuffer(),
      gravity: 'centre',
    });

    if (width >= 480 && height >= 240) {
      const cornerWidth = Math.round(
        Math.min(Math.max(width * 0.16, 110), 320),
      );
      const cornerHeight = Math.round(cornerWidth * assets.cornerRatio);
      const margin = Math.round(width * 0.02);
      if (cornerHeight + margin * 2 < height) {
        layers.push({
          input: await sharp(assets.corner)
            .resize({ width: cornerWidth, height: cornerHeight, fit: 'fill' })
            .toBuffer(),
          left: width - cornerWidth - margin,
          top: height - cornerHeight - margin,
        });
      }
    }
    return layers;
  }

  private static loadWatermark(): Promise<WatermarkAssets | null> {
    FileUtils.watermarkAssets ??= (async () => {
      try {
        const [center, corner] = await Promise.all([
          fs.readFile(path.join(WATERMARK_DIR, 'center.png')),
          fs.readFile(path.join(WATERMARK_DIR, 'corner.png')),
        ]);
        const [cm, km] = await Promise.all([
          sharp(center).metadata(),
          sharp(corner).metadata(),
        ]);
        return {
          center,
          centerRatio: (cm.height ?? 1) / (cm.width ?? 1),
          corner,
          cornerRatio: (km.height ?? 1) / (km.width ?? 1),
        };
      } catch (error) {
        FileUtils.logger.error(
          `Watermark assets missing in ${WATERMARK_DIR} – photos are stored WITHOUT watermark: ${(error as Error).message}`,
        );
        return null;
      }
    })();
    return FileUtils.watermarkAssets;
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

    const targets = [
      fullPath,
      FileUtils.thumbnailPath(fullPath),
      path.join(ORIGINALS_ROOT, cleanPath),
    ];

    for (const target of targets) {
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
