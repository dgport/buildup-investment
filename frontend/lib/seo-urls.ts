import { SITE_URL } from "./constants/env";
import { IS_RENT_SITE } from "./market";

export const SITE_NAME = IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment";
export function localizedUrl(path: string, locale: string, origin = SITE_URL) {
  const url = new URL(path, origin);
  const clean = url.pathname.replace(/^\/(ka|en)(?=\/|$)/, "") || "/";
  url.pathname = locale === "en" ? `/en${clean === "/" ? "" : clean}` : clean;
  return url.toString();
}
export function languageAlternates(path: string) {
  return { ka: localizedUrl(path, "ka"), en: localizedUrl(path, "en"), "x-default": localizedUrl(path, "ka") };
}
export function socialImage(locale: string) {
  return `/og/${IS_RENT_SITE ? "rent" : "sales"}-${locale === "en" ? "en" : "ka"}.jpg`;
}
