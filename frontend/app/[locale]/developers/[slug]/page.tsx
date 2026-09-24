import { publicPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { API_BASE_URL } from "@/lib/constants/env";
import type { Developer } from "@/lib/types/projects";
import { DeveloperDetailContent } from "../_components/DeveloperDetailContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("projects.developers");
  try {
    const res = await fetch(`${API_BASE_URL}/developers/${encodeURIComponent(slug)}?lang=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: t("notFound"), robots: { index: false, follow: false } };
    const dev = (await res.json()) as Developer;
    return { ...publicPageMetadata(dev.name, dev.description?.slice(0, 160) ?? t("subtitle"), `/developers/${dev.slug}`), robots: { index: !dev.isDemo, follow: true } };
  } catch {
    return { title: t("title") };
  }
}

export default async function DeveloperPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const res = await fetch(`${API_BASE_URL}/developers/${encodeURIComponent(slug)}?lang=${locale}`, { next: { revalidate: 60 } });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Developer request failed: ${res.status}`);
  const developer = await res.json() as Developer;
  return <><DeveloperDetailContent /></>;
}
