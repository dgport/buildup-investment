import { catalogueData, searchString, type SearchValues } from "@/lib/catalogue-seo";
import { PageLoader } from "@/components/shared/PageLoader";
import { publicPageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectsContent } from "./_components/ProjectsContent";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchValues> }): Promise<Metadata> {
  const t = await getTranslations("projects");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const filtered = Object.keys(query).some((key) => !["page", "view"].includes(key));
  const path = "/projects" + (page > 1 ? `?page=${page}` : "");
  return { ...(await publicPageMetadata(t("title") + (page > 1 ? ` · ${page}` : ""), t("metaDescription"), path)), robots: { index: !filtered, follow: true } };
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const query = await searchParams;
  const data = await catalogueData("projects", query, await getLocale());
  return (
    <Suspense fallback={<PageLoader />}>
      <ProjectsContent initialData={data} initialSearch={searchString(query)} />
    </Suspense>
  );
}
