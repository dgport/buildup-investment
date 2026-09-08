import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "./constants/env";

export type MetaPage = "home";

interface MetaEntry {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const SITE_NAME = "Build Up Investment";
/** JPG on purpose: social crawlers (Facebook, LinkedIn, X) do not render AVIF/WebP previews. */
const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg" };

export async function getPageMetadata(page: MetaPage): Promise<Metadata> {
  const locale = await getLocale();
  const meta: Record<MetaPage, MetaEntry> = (
    await import(`@/messages/${locale}/meta.json`)
  ).default;

  const entry = meta[page];

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
