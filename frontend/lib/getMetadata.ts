import { getLocale } from "next-intl/server";

type MetaPage =
  | "team"
  | "contact"
  | "home"
  | "about"
  | "services"
  | "financial-audit"
  | "tax-services"
  | "accounting"
  | "valuation"
  | "legal"
  | "consulting"
  | "teaching-center";

interface MetaEntry {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

export async function getPageMetadata(page: MetaPage) {
  const locale = await getLocale();
  const meta: Record<MetaPage, MetaEntry> = (
    await import(`@/messages/${locale}/meta.json`)
  ).default;

  const entry = meta[page];

  return {
    title: entry.title,
    description: entry.description,
    openGraph: {
      title: entry.ogTitle,
      description: entry.ogDescription,
      siteName: "Prestige Audit",
      images: [
        {
          url: "/og-image.avif",
          width: 1200,
          height: 630,
          alt: entry.ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: entry.ogTitle,
      description: entry.ogDescription,
      images: ["/og-image.avif"],
    },
  };
}
