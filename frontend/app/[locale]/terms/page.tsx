import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/shared/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return publicPageMetadata(t("legal.terms.title"), t("legal.terms.intro"), "/terms");
}

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
