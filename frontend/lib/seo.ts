import type { Metadata } from "next";

/** Metadata for private / transactional pages that must stay out of search. */
export const NO_INDEX: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Serialises structured data for a `<script type="application/ld+json">`. */
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
