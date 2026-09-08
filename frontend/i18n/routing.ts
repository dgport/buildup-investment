import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["ka", "en"] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const routing = defineRouting({
  locales,
  defaultLocale: "ka",
  // No /ka or /en prefix in URLs – the active locale lives in the NEXT_LOCALE
  // cookie. `localeDetection` must stay on, otherwise next-intl ignores the
  // cookie and always serves the default locale (middleware.ts strips the
  // Accept-Language header so first-time visitors still get Georgian).
  localePrefix: "never",
  localeDetection: true,
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
