import { API_IMAGE_URL } from "../constants/env";

/**
 * Turns the relative path stored by the API (`uploads/properties/x.jpg`)
 * into an absolute URL. Absolute URLs and data/blob URLs pass through.
 */
export function resolveImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath;
  return `${API_IMAGE_URL}/${imagePath.replace(/^\/+/, "")}`;
}

/**
 * 640px version the API writes next to every upload (`x.jpg` → `x_t.jpg`).
 * Use it for cards, tables and map popups; photos uploaded before the
 * optimizer existed have no thumbnail, so always pair it with
 * `onError={fallbackToFullImage}`.
 */
export function thumbnailUrl(imagePath?: string | null): string | null {
  const full = resolveImageUrl(imagePath);
  if (!full || /^(data:|blob:)/i.test(full)) return full;
  return full.replace(/\.[a-z0-9]+$/i, "_t.jpg");
}

/** `onError` handler that swaps a missing thumbnail for the full-size image. */
export function fallbackToFullImage(
  event: React.SyntheticEvent<HTMLImageElement>,
  imagePath?: string | null,
) {
  const full = resolveImageUrl(imagePath);
  const img = event.currentTarget;
  if (full && img.src !== full) img.src = full;
}
