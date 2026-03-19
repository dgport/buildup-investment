import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "ka"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: ["ka", "en"],
  defaultLocale: "ka",
  localePrefix: "never",
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
