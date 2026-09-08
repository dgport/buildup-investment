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
    if (!res.ok) return { title: t("notFound") };
    const dev = (await res.json()) as Developer;
    return { title: dev.name, description: dev.description?.slice(0, 160) ?? t("subtitle") };
  } catch {
    return { title: t("title") };
  }
}

export default function DeveloperPage() {
  return <DeveloperDetailContent />;
}
