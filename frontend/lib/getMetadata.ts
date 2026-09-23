import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IS_RENT_SITE } from "./market";
import { SITE_URL } from "./constants/env";

export type MetaPage = "home";

interface MetaEntry {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const SITE_NAME = IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment";
/** JPG on purpose: social crawlers (Facebook, LinkedIn, X) do not render AVIF/WebP previews. */
const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg" };

export async function getPageMetadata(page: MetaPage): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations(`meta.${page}`);
  const entry: MetaEntry = { title: t("title"), description: t("description"), ogTitle: t("ogTitle"), ogDescription: t("ogDescription") };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: entry.title,
      template: `%s · ${SITE_NAME}`,
    },
    description: entry.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "ka" ? "ka_GE" : "en_US",
      title: entry.ogTitle,
      description: entry.ogDescription,
      url: SITE_URL,
      images: [{ ...OG_IMAGE, alt: entry.ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.ogTitle,
      description: entry.ogDescription,
      images: [OG_IMAGE.url],
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, email: true },
  };
}
