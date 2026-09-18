import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactSection from "./_components/ContactSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return publicPageMetadata(t("label"), t("subheading"), "/contact");
}

export default function Page() {
  return <ContactSection />;
}
