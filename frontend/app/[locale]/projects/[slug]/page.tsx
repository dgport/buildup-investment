import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { API_BASE_URL, SITE_URL } from "@/lib/constants/env";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { jsonLd } from "@/lib/seo";
import type { Project } from "@/lib/types/projects";
import { ProjectDetailContent } from "../_components/ProjectDetailContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProject(slug: string, lang: string): Promise<Project | null> {
  const res = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(slug)}?lang=${lang}`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Project request failed: ${res.status}`);
  return (await res.json()) as Project;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("projects");
  const project = await fetchProject(slug, locale);
  if (!project) return { title: t("notFound"), robots: { index: false, follow: false } };

  const title = `${project.title ?? project.slug} · ${project.developer.name}`;
  const description =
    project.description?.slice(0, 160) ||
    [t(`status.${project.status}`), project.regionName].filter(Boolean).join(" · ");
  const image = resolveImageUrl(project.coverImage);
  return {
    title,
    description,
    robots: project.isDemo ? { index: false, follow: true } : { index: true, follow: true },
    twitter: { card: "summary_large_image", title, description, images: [image || "/og-image.jpg"] },
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/projects/${project.slug}`,
      ...(image && { images: [{ url: image }] }),
    },
  };
}

function projectJsonLd(project: Project, locale: string) {
  const coords = project.location?.split(",").map((v) => Number(v.trim()));
  const prices = project.unitTypes
    .map((u) => u.priceFrom)
    .filter((p): p is number => typeof p === "number" && p > 0);
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.title ?? project.slug,
    description: project.description ?? undefined,
    url: `${SITE_URL}/projects/${project.slug}`,
    inLanguage: locale,
    image: project.images.map((i) => resolveImageUrl(i.imageUrl)).filter(Boolean),
    numberOfAccommodationUnits: project.totalApartments ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address ?? undefined,
      addressLocality: project.regionName ?? undefined,
      addressCountry: "GE",
    },
    geo:
      coords && coords.length === 2 && coords.every((n) => !Number.isNaN(n))
        ? { "@type": "GeoCoordinates", latitude: coords[0], longitude: coords[1] }
        : undefined,
    provider: {
      "@type": "Organization",
      name: project.developer.name,
      url: `${SITE_URL}/developers/${project.developer.slug}`,
      logo: resolveImageUrl(project.developer.logo) ?? undefined,
      telephone: project.developer.phone ?? undefined,
    },
    offers:
      prices.length || project.priceFrom
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: project.priceFrom ?? Math.min(...prices),
            offerCount: project.unitTypes.length || undefined,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = await fetchProject(slug, locale);
  if (!project) notFound();

  return (
    <>
      {project && !project.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(projectJsonLd(project, locale)) }}
        />
      )}
      <Suspense>
        <ProjectDetailContent />
      </Suspense>
    </>
  );
}
