"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useProperties } from "@/lib/hooks/useProperties";
import PropertyCard from "@/components/shared/PropertyCard";
import { CardSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/constants/routes";
import type { Property } from "@/lib/types/properties";

/** Up to four other listings of the same type/deal (same region when possible). */
export function SimilarProperties({ property }: { property: Property }) {
  const t = useTranslations("properties");
  const locale = useLocale();
  const { data, isLoading } = useProperties({
    lang: locale,
    limit: 4,
    propertyType: property.propertyType,
    dealType: property.dealType,
    region: property.region ?? undefined,
    excludeId: property.id,
  });
  const items = data?.data ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-teal-950">{t("similarTitle")}</h2>
        <Link
          href={`${ROUTES.PROPERTIES}?propertyType=${property.propertyType}&dealType=${property.dealType}`}
          className="text-sm font-semibold text-teal-700 hover:text-amber-600"
        >
          {t("similarSeeAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} tall />)
          : items.map((p) => <PropertyCard key={p.id} property={p} />)}
      </div>
    </section>
  );
}
