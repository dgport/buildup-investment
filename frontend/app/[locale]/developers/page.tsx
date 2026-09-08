import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DevelopersContent } from "./_components/DevelopersContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.developers");
  return { title: t("title"), description: t("subtitle") };
}

export default function DevelopersPage() {
  return <DevelopersContent />;
}
