import { publicPageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectsContent } from "./_components/ProjectsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return publicPageMetadata(t("title"), t("metaDescription"), "/projects");
}

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsContent />
    </Suspense>
  );
}
