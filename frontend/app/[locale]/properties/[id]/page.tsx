import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PropertyDetailContent } from "../_components/PropertyDetailContent";
import { API_BASE_URL } from "@/lib/constants/env";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import type { Property } from "@/lib/types/properties";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProperty(id: string, lang: string): Promise<Property | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/properties/${encodeURIComponent(id)}?lang=${lang}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as Property;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("properties");
  const property = await fetchProperty(id, locale);

  if (!property) {
    return { title: t("notFound"), description: t("description") };
  }

  const title = property.translation?.title || `${t("title")} #${property.externalId}`;
  const description =
    property.translation?.description?.slice(0, 160) ||
    [
      t(`enums.propertyType.${property.propertyType}`),
      t(`enums.dealType.${property.dealType}`),
      property.regionName,
    ]
      .filter(Boolean)
      .join(" · ");
  const image = resolveImageUrl(property.galleryImages?.[0]?.imageUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image && { images: [{ url: image }] }),
    },
  };
}

export default function PropertyDetailPage() {
  return (
    <Suspense>
      <PropertyDetailContent />
    </Suspense>
  );
}
