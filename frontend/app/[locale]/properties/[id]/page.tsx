import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PropertyDetailContent } from "../_components/PropertyDetailContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return {
    title: t("detailPropertyId"),
    description: t("description"),
  };
}

export default function PropertyDetailPage() {
  return (
    <Suspense>
      <PropertyDetailContent />
    </Suspense>
  );
}
