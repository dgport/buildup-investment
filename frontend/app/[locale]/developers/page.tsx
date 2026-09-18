import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DevelopersContent } from "./_components/DevelopersContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.developers");
  return publicPageMetadata(t("title"), t("subtitle"), "/developers");
}

export default function DevelopersPage() {
  return <DevelopersContent />;
}
