import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NO_INDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { ...NO_INDEX, title: t("nav.signin") };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
