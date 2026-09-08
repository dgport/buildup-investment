"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PropertyType, DealType, Region } from "@/lib/types/properties";

const MAX_PRICE = 1_000_000;
const PRICE_STEP = 10_000;
const MAX_AREA = 500;
const AREA_STEP = 10;
const ALL = "all";

interface FilterState {
  propertyType: string;
  dealType: string;
  region: string;
  externalId: string;
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
  rooms: string;
  bedrooms: string;
}

const readFilters = (params: URLSearchParams): FilterState => ({
  propertyType: params.get("propertyType") ?? ALL,
  dealType: params.get("dealType") ?? ALL,
  region: params.get("region") ?? ALL,
  externalId: params.get("externalId") ?? "",
  priceFrom: Number(params.get("priceFrom") ?? 0) || 0,
  priceTo: Number(params.get("priceTo") ?? MAX_PRICE) || MAX_PRICE,
  areaFrom: Number(params.get("areaFrom") ?? 0) || 0,
  areaTo: Number(params.get("areaTo") ?? MAX_AREA) || MAX_AREA,
  rooms: params.get("rooms") ?? ALL,
  bedrooms: params.get("bedrooms") ?? ALL,
});

const EMPTY: FilterState = {
  propertyType: ALL,
  dealType: ALL,
  region: ALL,
  externalId: "",
  priceFrom: 0,
  priceTo: MAX_PRICE,
  areaFrom: 0,
  areaTo: MAX_AREA,
  rooms: ALL,
  bedrooms: ALL,
};

export function PropertyFilters() {
  const t = useTranslations("properties");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() =>
    readFilters(searchParams),
  );

  // Keep the sheet in sync when the URL changes (back button, clear, …)
  useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  const isLandSelected = filters.propertyType === PropertyType.LAND;

  const activeFilterCount = [
    filters.propertyType !== ALL,
    filters.dealType !== ALL,
    filters.region !== ALL,
    filters.externalId.trim() !== "",
    filters.priceFrom > 0,
    filters.priceTo < MAX_PRICE,
    filters.areaFrom > 0,
    filters.areaTo < MAX_AREA,
    filters.rooms !== ALL && !isLandSelected,
    filters.bedrooms !== ALL && !isLandSelected,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    if (filters.propertyType !== ALL)
      params.set("propertyType", filters.propertyType);
    if (filters.dealType !== ALL) params.set("dealType", filters.dealType);
    if (filters.region !== ALL) params.set("region", filters.region);
    if (filters.externalId.trim())
      params.set("externalId", filters.externalId.trim());
    if (filters.priceFrom > 0) params.set("priceFrom", String(filters.priceFrom));
    if (filters.priceTo < MAX_PRICE) params.set("priceTo", String(filters.priceTo));
    if (filters.areaFrom > 0) params.set("areaFrom", String(filters.areaFrom));
    if (filters.areaTo < MAX_AREA) params.set("areaTo", String(filters.areaTo));
    if (filters.rooms !== ALL && !isLandSelected)
      params.set("rooms", filters.rooms);
    if (filters.bedrooms !== ALL && !isLandSelected)
      params.set("bedrooms", filters.bedrooms);

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters(EMPTY);
    router.push(`${pathname}?page=1`);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 text-teal-900 font-medium text-sm shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            <span>{t("filterTitle")}</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-teal-950 text-xs font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full sm:w-[480px] flex flex-col p-0 overflow-x-hidden border-r border-teal-100"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-teal-100 bg-teal-950">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-400 rounded-lg">
                <SlidersHorizontal className="w-4 h-4 text-teal-950" />
              </div>
              <SheetTitle className="text-white font-semibold text-base m-0">
                {t("propertyFilters")}
              </SheetTitle>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-amber-400 transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5" />
                {t("clear")}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <Field label={t("propertyId")}>
              <Input
                placeholder={t("enterPropertyId")}
                value={filters.externalId}
                onChange={(e) =>
                  setFilters({ ...filters, externalId: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="h-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg text-sm"
              />
            </Field>

            <Field label={t("propertyType")}>
              <Select
                value={filters.propertyType}
                onValueChange={(v) => setFilters({ ...filters, propertyType: v })}
              >
                <SelectTrigger className="h-10 w-full border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue placeholder={t("allTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allTypes")}</SelectItem>
                  {Object.values(PropertyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`enums.propertyType.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("dealType")}>
              <Select
                value={filters.dealType}
                onValueChange={(v) => setFilters({ ...filters, dealType: v })}
              >
                <SelectTrigger className="h-10 w-full border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue placeholder={t("allDeals")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allDeals")}</SelectItem>
                  {Object.values(DealType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`enums.dealType.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("region")}>
              <Select
                value={filters.region}
                onValueChange={(v) => setFilters({ ...filters, region: v })}
              >
                <SelectTrigger className="h-10 w-full border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue placeholder={t("allRegions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allRegions")}</SelectItem>
                  {Object.values(Region).map((region) => (
                    <SelectItem key={region} value={region}>
                      {t(`enums.region.${region}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="border-t border-teal-100" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>{t("priceRange")}</FieldLabel>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {filters.priceFrom > 0 || filters.priceTo < MAX_PRICE
                    ? `$${filters.priceFrom.toLocaleString()} – $${filters.priceTo.toLocaleString()}`
                    : t("any")}
                </span>
              </div>
              <Slider
                min={0}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={[filters.priceFrom, filters.priceTo]}
                onValueChange={([from, to]) =>
                  setFilters({ ...filters, priceFrom: from, priceTo: to })
                }
                className="[&_[role=slider]]:bg-teal-900 [&_[role=slider]]:border-teal-900 [&_.range]:bg-teal-700"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>$0</span>
                <span>${MAX_PRICE.toLocaleString()}+</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>{t("areaRange")}</FieldLabel>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {filters.areaFrom > 0 || filters.areaTo < MAX_AREA
                    ? `${filters.areaFrom} – ${filters.areaTo} m²`
                    : t("any")}
                </span>
              </div>
              <Slider
                min={0}
                max={MAX_AREA}
                step={AREA_STEP}
                value={[filters.areaFrom, filters.areaTo]}
                onValueChange={([from, to]) =>
                  setFilters({ ...filters, areaFrom: from, areaTo: to })
                }
                className="[&_[role=slider]]:bg-teal-900 [&_[role=slider]]:border-teal-900 [&_.range]:bg-teal-700"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 m²</span>
                <span>{MAX_AREA} m²+</span>
              </div>
            </div>

            {!isLandSelected && (
              <>
                <div className="border-t border-teal-100" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("rooms")}>
                    <Select
                      value={filters.rooms}
                      onValueChange={(v) => setFilters({ ...filters, rooms: v })}
                    >
                      <SelectTrigger className="h-10 w-full border-teal-200 rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>{t("any")}</SelectItem>
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n === "5" ? "5+" : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label={t("bedrooms")}>
                    <Select
                      value={filters.bedrooms}
                      onValueChange={(v) => setFilters({ ...filters, bedrooms: v })}
                    >
                      <SelectTrigger className="h-10 w-full border-teal-200 rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>{t("any")}</SelectItem>
                        {["1", "2", "3", "4"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n === "4" ? "4+" : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-teal-100 bg-white">
            <button
              onClick={applyFilters}
              className="w-full h-11 rounded-xl bg-teal-900 hover:bg-teal-800 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150"
            >
              <Search className="w-4 h-4" />
              {t("apply")}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
          {t("clear")}
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wide text-teal-700">
      {children}
    </label>
  );
}
