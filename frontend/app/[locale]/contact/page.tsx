import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactSection from "./_components/ContactSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("label"), description: t("subheading") };
}

export default function Page() {
  return <ContactSection />;
}
