import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { API_BASE_URL } from "@/lib/constants/env";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import type { Project } from "@/lib/types/projects";
import { ProjectDetailContent } from "../_components/ProjectDetailContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProject(slug: string, lang: string): Promise<Project | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/projects/${encodeURIComponent(slug)}?lang=${lang}`,
      { next: { revalidate: 60 } },
    );
    return res.ok ? ((await res.json()) as Project) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("projects");
  const project = await fetchProject(slug, locale);
  if (!project) return { title: t("notFound") };

  const title = `${project.title ?? project.slug} · ${project.developer.name}`;
  const description =
    project.description?.slice(0, 160) ||
    [t(`status.${project.status}`), project.regionName].filter(Boolean).join(" · ");
  const image = resolveImageUrl(project.coverImage);
  return {
    title,
    description,
    openGraph: { title, description, type: "article", ...(image && { images: [{ url: image }] }) },
  };
}

export default function ProjectPage() {
  return (
    <Suspense>
      <ProjectDetailContent />
    </Suspense>
  );
}
