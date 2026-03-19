import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PropertiesContent } from "./_components/PropertiesContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
