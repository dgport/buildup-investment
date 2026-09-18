import type { Metadata } from "next";
import { SITE_URL } from "./constants/env";

/** Explicit page metadata avoids inheriting the homepage canonical/social title. */
export function publicPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${SITE_URL}${path}`, type: "website", images: [{ url: "/og-image.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
  };
}

/** Metadata for private / transactional pages that must stay out of search. */
export const NO_INDEX: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Serialises structured data for a `<script type="application/ld+json">`. */
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
