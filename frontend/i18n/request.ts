import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { IS_RENT_SITE } from "../lib/market";

function mergeMessages(base: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    result[key] = value && typeof value === "object" && !Array.isArray(value)
      ? mergeMessages((base[key] ?? {}) as Record<string, unknown>, value as Record<string, unknown>)
      : value;
  }
  return result;
}

const NAMESPACES = [
  "common",
  "main",
  "contact",
  "properties",
  "dashboard",
  "meta",
  "auth",
  "projects",
  "admin",
  "terms",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [
      ns,
      (await import(`../messages/${locale}/${ns}.json`)).default,
    ]),
  );

  const messages = Object.fromEntries(entries);
  const overrides = IS_RENT_SITE ? (await import(`../messages/${locale}/rental.json`)).default : {};
  return {
    locale,
    messages: mergeMessages(messages, overrides) as typeof messages,
  };
});
