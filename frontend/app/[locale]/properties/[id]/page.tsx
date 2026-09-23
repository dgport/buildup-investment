import { PageLoader } from "@/components/shared/PageLoader";
import { IS_RENT_SITE, propertySiteUrl } from "@/lib/market";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PropertyDetailContent } from "../_components/PropertyDetailContent";
import { API_BASE_URL } from "@/lib/constants/env";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { jsonLd } from "@/lib/seo";
import type { Property } from "@/lib/types/properties";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProperty(id: string, lang: string): Promise<Property | null> {
  const res = await fetch(
    `${API_BASE_URL}/properties/${encodeURIComponent(id)}?lang=${lang}`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Property request failed: ${res.status}`);
  return (await res.json()) as Property;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("properties");
  const property = await fetchProperty(id, locale);

  if (!property) {
    return { title: t("notFound"), robots: { index: false, follow: false } };
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
    robots: property.isDemo ? { index: false, follow: true } : { index: true, follow: true },
    twitter: { card: "summary_large_image", title, description, images: [image || "/og-image.jpg"] },
    alternates: { canonical: propertySiteUrl(property) },
    openGraph: {
      title,
      description,
      type: "article",
      url: propertySiteUrl(property),
      ...(image && { images: [{ url: image }] }),
    },
  };
}

/** schema.org structured data for rich results (price, location, photos). */
function propertyJsonLd(property: Property, locale: string) {
  const image = property.galleryImages
    .map((g) => resolveImageUrl(g.imageUrl))
    .filter((s): s is string => !!s);
  const coords = property.location?.split(",").map((v) => Number(v.trim()));
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.translation?.title ?? `#${property.externalId}`,
    description: property.translation?.description ?? undefined,
    url: propertySiteUrl(property),
    datePosted: property.createdAt,
    inLanguage: locale,
    image,
    offers: property.price
      ? {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        }
      : undefined,
    about: {
      "@type": property.propertyType === "LAND" ? "Place" : "Accommodation",
      floorSize: property.totalArea
        ? { "@type": "QuantitativeValue", value: property.totalArea, unitCode: "MTK" }
        : undefined,
      numberOfRooms: property.rooms ?? undefined,
      numberOfBedrooms: property.bedrooms ?? undefined,
      numberOfBathroomsTotal: property.bathrooms ?? undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.translation?.address ?? property.address ?? undefined,
        addressLocality: property.regionName ?? undefined,
        addressCountry: "GE",
      },
      geo:
        coords && coords.length === 2 && coords.every((n) => !Number.isNaN(n))
          ? { "@type": "GeoCoordinates", latitude: coords[0], longitude: coords[1] }
          : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const property = await fetchProperty(id, locale);
  if (!property) notFound();
  if ((property.dealType !== "SALE") !== IS_RENT_SITE) permanentRedirect(propertySiteUrl(property));

  return (
    <>
      {property && !property.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(propertyJsonLd(property, locale)) }}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        <PropertyDetailContent />
      </Suspense>
    </>
  );
}
