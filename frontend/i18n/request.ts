/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = {
    main: (await import(`../messages/${locale}/main.json`)).default,
    contact: (await import(`../messages/${locale}/contact.json`)).default,
    properties: (await import(`../messages/${locale}/properties.json`)).default,
    meta: (await import(`../messages/${locale}/meta.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
