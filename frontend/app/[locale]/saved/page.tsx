import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SavedPropertiesContent } from "./SavedPropertiesContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.saved");
  return { title: t("title"), description: t("privacy"), robots: { index: false, follow: true }, alternates: { canonical: null } };
}

export default function SavedPropertiesPage() {
  return <SavedPropertiesContent />;
}
