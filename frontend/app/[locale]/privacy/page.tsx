import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/shared/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: t("legal.privacy.title"), alternates: { canonical: "/privacy" } };
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
