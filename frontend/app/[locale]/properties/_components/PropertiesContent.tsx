"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Building2, SearchX } from "lucide-react";
import { useProperties } from "@/lib/hooks/useProperties";
import { Pagination } from "@/components/shared/Pagination";
import type { PropertyFilters as PropertyFiltersType } from "@/lib/types/properties";
import { Region } from "@/lib/types/properties";
import PropertyCard from "@/components/shared/PropertyCard";
import { PropertyFilters } from "./PropertyFilters";

const PROPERTIES_PER_PAGE = 12;

function parseSearchParams(searchParams: URLSearchParams): PropertyFiltersType {
  const get = (key: string) => searchParams.get(key);
  const getInt = (key: string): number | undefined => {
    const v = get(key);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return isNaN(n) ? undefined : n;
  };

  return {
    page: getInt("page") ?? 1,
    limit: PROPERTIES_PER_PAGE,
    propertyType: get("propertyType") ?? undefined,
    dealType: get("dealType") ?? undefined,
    region: (get("region") as Region) ?? undefined,
    externalId: get("externalId") ?? undefined,
    priceFrom: getInt("priceFrom"),
    priceTo: getInt("priceTo"),
    areaFrom: getInt("areaFrom"),
    areaTo: getInt("areaTo"),
    rooms: getInt("rooms"),
    bedrooms: getInt("bedrooms"),
  };
}

export function PropertiesContent() {
  const t = useTranslations("properties");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const filters = parseSearchParams(searchParams);

  const {
    data: response,
    isLoading,
    error,
  } = useProperties({
    ...filters,
    lang: locale,
  });

  const properties = response?.data ?? [];
  const meta = response?.meta;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-28 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-900 rounded-xl p-2">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-teal-950">{t("title")}</h1>
          </div>
          {meta && (
            <p className="text-sm text-gray-500 ml-14">
              {t("count", { count: meta.total })}
            </p>
          )}
        </div>

        <PropertyFilters />

        {isLoading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState message={t("error")} />
        ) : properties.length === 0 ? (
          <EmptyState message={t("empty")} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    externalId: property.externalId,
                    galleryImages: property.galleryImages,
                    priceUSD: property.price,
                    regionName: property.regionName,
                    rooms: property.rooms ?? undefined,
                    title: property.translation?.title ?? "",
                    totalArea: property.totalArea,
                    hotSale: property.hotSale,
                    dateAdded: property.createdAt,
                  }}
                />
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={filters.page ?? 1}
                  totalPages={meta.totalPages}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  const t = useTranslations("properties");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <SearchX className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-lg font-semibold text-gray-700 mb-1">{message}</p>
      <p className="text-sm text-gray-400">{t("emptyHint")}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
        <p className="text-red-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
