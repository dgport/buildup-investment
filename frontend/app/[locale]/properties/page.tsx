import { catalogueData, searchString, type SearchValues } from "@/lib/catalogue-seo";
import { PageLoader } from "@/components/shared/PageLoader";
import { publicPageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PropertiesContent } from "./_components/PropertiesContent";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchValues> }): Promise<Metadata> {
  const t = await getTranslations("properties");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const filtered = Object.keys(query).some((key) => !["page", "view"].includes(key));
  const path = "/properties" + (page > 1 ? `?page=${page}` : "");
  return { ...(await publicPageMetadata(t("title") + (page > 1 ? ` · ${page}` : ""), t("description"), path)), robots: { index: !filtered, follow: true } };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const query = await searchParams;
  const data = await catalogueData("properties", query, await getLocale());
  return (
    <Suspense fallback={<PageLoader />}>
      <PropertiesContent initialData={data} initialSearch={searchString(query)} />
    </Suspense>
  );
}
