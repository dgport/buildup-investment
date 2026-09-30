import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/shared/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return publicPageMetadata(t("legal.privacy.title"), t("legal.privacy.intro"), "/privacy");
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
