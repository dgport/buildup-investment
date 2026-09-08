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
