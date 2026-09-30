import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { IS_RENT_SITE } from "./market";
import { SITE_URL } from "./constants/env";
import { publicPageMetadata } from "./seo";

export type MetaPage = "home";

interface MetaEntry {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const SITE_NAME = IS_RENT_SITE ? "BuildUp Rent" : "Build Up Investment";


export async function getPageMetadata(page: MetaPage): Promise<Metadata> {
  const t = await getTranslations(`meta.${page}`);
  const entry: MetaEntry = { title: t("title"), description: t("description"), ogTitle: t("ogTitle"), ogDescription: t("ogDescription") };

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    ...(await publicPageMetadata(entry.ogTitle, entry.ogDescription, "/")),
    title: { default: entry.title, template: `%s · ${SITE_NAME}` },
    description: entry.description,
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, email: true },
  };
}
