/**
 * Public runtime configuration. NEXT_PUBLIC_* values are inlined at build
 * time, so keep every access in one place.
 */
const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** e.g. http://localhost:3000/api */
export const API_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
);

/** Origin that serves /uploads/… (defaults to the API origin without /api). */
export const API_IMAGE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_IMAGE_URL ?? API_BASE_URL.replace(/\/api$/, ""),
);

export const MAPBOX_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
