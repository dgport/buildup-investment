export const MAX_IMAGES = 20;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif";

export interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

/** Match the server's accepted formats, rather than accepting every image MIME. */
export function supportedImage(type: string) {
  return /^image\/(jpe?g|png|gif|webp|avif|heic|heif)$/i.test(type);
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
