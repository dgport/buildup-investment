import { publicPageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PropertiesContent } from "./_components/PropertiesContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return publicPageMetadata(t("title"), t("description"), "/properties");
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
