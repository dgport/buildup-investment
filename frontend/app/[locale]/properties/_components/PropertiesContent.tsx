"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { useProperties } from "@/lib/hooks/useProperties";
import { useCurrency } from "@/lib/currency";
import { Pagination } from "@/components/shared/Pagination";
import type { PropertyFilters as PropertyFiltersType } from "@/lib/types/properties";
import PropertyCard from "@/components/shared/PropertyCard";
import { CardGridSkeleton } from "@/components/shared/Skeletons";
import { PropertyFilters } from "./PropertyFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORTS = ["featured", "newest", "price_asc", "price_desc", "area_desc"] as const;

const PROPERTIES_PER_PAGE = 12;

function parseSearchParams(searchParams: URLSearchParams): PropertyFiltersType {
  const get = (key: string) => searchParams.get(key) ?? undefined;
  const getInt = (key: string): number | undefined => {
    const v = get(key);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  };

  return {
    page: Math.max(1, getInt("page") ?? 1),
    limit: PROPERTIES_PER_PAGE,
    propertyType: get("propertyType"),
    dealType: get("dealType"),
    region: get("region"),
    externalId: get("externalId"),
    priceFrom: getInt("priceFrom"),
    priceTo: getInt("priceTo"),
    areaFrom: getInt("areaFrom"),
    areaTo: getInt("areaTo"),
    rooms: getInt("rooms"),
    bedrooms: getInt("bedrooms"),
    sort: SORTS.includes(get("sort") as (typeof SORTS)[number])
      ? (get("sort") as PropertyFiltersType["sort"])
      : undefined,
  };
}

export function PropertiesContent() {
  const t = useTranslations("properties");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = parseSearchParams(searchParams);
  const { currency, setCurrency } = useCurrency();

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data: response, isLoading, isFetching, error } = useProperties({ ...filters, lang: locale });

  const properties = response?.data ?? [];
  const meta = response?.meta;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search band */}
      <section className="relative bg-teal-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 70% at 85% 0%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(20,184,166,0.15), transparent 60%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/90 font-semibold mb-1.5">{t("eyebrow")}</p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t("title")}</h1>
            </div>
            <p className="text-sm text-teal-100/70">{meta ? t("count", { count: meta.total }) : " "}</p>
          </div>
          <PropertyFilters />
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Results toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-500">
            {meta ? t("count", { count: meta.total }) : ""}
            {isFetching && !isLoading ? " …" : ""}
          </p>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5" role="group" aria-label={t("filters.currency")}>
              {(["USD", "GEL"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`h-9 px-3 rounded-lg text-sm font-semibold transition ${
                    currency === c ? "bg-teal-900 text-white shadow" : "text-teal-800 hover:bg-slate-50"
                  }`}
                >
                  {c === "USD" ? "$ USD" : "₾ GEL"}
                </button>
              ))}
            </div>
            <Select value={filters.sort ?? "featured"} onValueChange={setSort}>
              <SelectTrigger className="h-10 w-[190px] border-slate-200 rounded-xl text-sm bg-white">
                <SelectValue placeholder={t("sort")} />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s} value={s}>{t(`sortOptions.${s}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton count={8} tall />
        ) : error ? (
          <ErrorState message={t("error")} />
        ) : properties.length === 0 ? (
          <EmptyState message={t("empty")} />
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10 transition-opacity ${isFetching ? "opacity-70" : ""}`}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
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

function EmptyState({ message }: { message: string }) {
  const t = useTranslations("properties");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center card">
      <div className="bg-teal-50 rounded-full p-6 mb-4">
        <SearchX className="w-10 h-10 text-teal-600" />
      </div>
      <p className="text-lg font-semibold text-teal-950 mb-1">{message}</p>
      <p className="text-sm text-slate-500">{t("emptyHint")}</p>
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
