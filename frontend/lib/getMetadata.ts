import { getLocale } from "next-intl/server";

export type MetaPage = "home";

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
      siteName: "Build Up Investment",
      url: "https://buildup.ge",
      images: [
        {
          url: "/Logo.png",
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
