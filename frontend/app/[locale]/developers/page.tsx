import { API_BASE_URL } from "@/lib/constants/env";
import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DevelopersContent } from "./_components/DevelopersContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.developers");
  return publicPageMetadata(t("title"), t("subtitle"), "/developers");
}

export default async function DevelopersPage() {
  const locale = await getLocale();
  const response = await fetch(`${API_BASE_URL}/developers?lang=${locale}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Developers request failed: ${response.status}`);
  return <DevelopersContent initialData={await response.json()} />;
}
