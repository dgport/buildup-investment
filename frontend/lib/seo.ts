import type { Metadata } from "next";
import { SITE_URL } from "./constants/env";
import { getLocale } from "next-intl/server";
import { languageAlternates, localizedUrl, SITE_NAME, socialImage } from "./seo-urls";

/** Explicit page metadata avoids inheriting the homepage canonical/social title. */
export async function publicPageMetadata(title: string, description: string, path: string, image?: string | null): Promise<Metadata> {
  const locale = await getLocale();
  const url = localizedUrl(path, locale);
  const imageUrl = image || new URL(socialImage(locale), SITE_URL).toString();
  description = description.replace(/\s+/g, " ").trim().slice(0, 170);
  return {
    title, description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, type: "website", siteName: SITE_NAME, locale: locale === "ka" ? "ka_GE" : "en_US", alternateLocale: [locale === "ka" ? "en_US" : "ka_GE"], images: [{ url: imageUrl, alt: title, ...(!image && { width: 1200, height: 630, type: "image/jpeg" }) }] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: imageUrl, alt: title }] },
  };
}

/** Metadata for private / transactional pages that must stay out of search. */
export const NO_INDEX: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Serialises structured data for a `<script type="application/ld+json">`. */
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
