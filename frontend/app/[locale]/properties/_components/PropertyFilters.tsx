"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
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
import { PropertyType, DealType } from "@/lib/types/properties";
import { useProperties } from "@/lib/hooks/useProperties";

const MAX_PRICE = 1000000;
const PRICE_STEP = 10000;
const MAX_AREA = 500;
const AREA_STEP = 10;

function formatEnumValue(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

interface PropertyFiltersProps {
  onFilterChange?: () => void;
}

export function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const t = useTranslations("properties");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    propertyType: searchParams.get("propertyType") ?? "all",
    dealType: searchParams.get("dealType") ?? "all",
    region: searchParams.get("region") ?? "all",
    externalId: searchParams.get("externalId") ?? "",
    priceFrom: searchParams.get("priceFrom")
      ? parseInt(searchParams.get("priceFrom")!)
      : 0,
    priceTo: searchParams.get("priceTo")
      ? parseInt(searchParams.get("priceTo")!)
      : MAX_PRICE,
    areaFrom: searchParams.get("areaFrom")
      ? parseInt(searchParams.get("areaFrom")!)
      : 0,
    areaTo: searchParams.get("areaTo")
      ? parseInt(searchParams.get("areaTo")!)
      : MAX_AREA,
    rooms: searchParams.get("rooms") ?? "all",
    bedrooms: searchParams.get("bedrooms") ?? "all",
  });

  const isLandSelected = filters.propertyType === PropertyType.LAND;

  useEffect(() => {
    if (isLandSelected) {
      setFilters((prev) => ({ ...prev, rooms: "all", bedrooms: "all" }));
    }
  }, [isLandSelected]);

  const { data: allPropertiesResponse } = useProperties({
    lang: locale,
    limit: 1000,
  });

  const uniqueRegions = useMemo(() => {
    if (!allPropertiesResponse?.data) return [];
    const map = new Map<string, string>();
    allPropertiesResponse.data.forEach((p) => {
      if (p.region && p.regionName) map.set(p.region, p.regionName);
    });
    return Array.from(map.entries())
      .map(([region, regionName]) => ({ region, regionName }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName));
  }, [allPropertiesResponse]);

  const activeFilterCount = [
    filters.propertyType !== "all",
    filters.dealType !== "all",
    filters.region !== "all",
    filters.externalId.trim() !== "",
    filters.priceFrom > 0,
    filters.priceTo < MAX_PRICE,
    filters.areaFrom > 0,
    filters.areaTo < MAX_AREA,
    filters.rooms !== "all",
    filters.bedrooms !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (filters.propertyType !== "all")
      params.set("propertyType", filters.propertyType);
    if (filters.dealType !== "all") params.set("dealType", filters.dealType);
    if (filters.region !== "all") params.set("region", filters.region);
    if (filters.externalId.trim())
      params.set("externalId", filters.externalId.trim());
    if (filters.priceFrom > 0)
      params.set("priceFrom", String(filters.priceFrom));
    if (filters.priceTo < MAX_PRICE)
      params.set("priceTo", String(filters.priceTo));
    if (filters.areaFrom > 0) params.set("areaFrom", String(filters.areaFrom));
    if (filters.areaTo < MAX_AREA) params.set("areaTo", String(filters.areaTo));
    if (filters.rooms !== "all" && !isLandSelected)
      params.set("rooms", filters.rooms);
    if (filters.bedrooms !== "all" && !isLandSelected)
      params.set("bedrooms", filters.bedrooms);

    router.push(`${pathname}?${params.toString()}`);
    onFilterChange?.();
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "all",
      dealType: "all",
      region: "all",
      externalId: "",
      priceFrom: 0,
      priceTo: MAX_PRICE,
      areaFrom: 0,
      areaTo: MAX_AREA,
      rooms: "all",
      bedrooms: "all",
    });
    router.push(`${pathname}?page=1`);
    onFilterChange?.();
  };

  return (
    <div className="mb-8">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 text-teal-900 font-medium text-sm shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            <span>{t("filterTitle", { defaultValue: "Filters" })}</span>
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
                {t("propertyFilters", { defaultValue: "Property Filters" })}
              </SheetTitle>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-amber-400 transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5" />
                {t("clear", { defaultValue: "Clear all" })}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <Field label={t("propertyId", { defaultValue: "Search by ID" })}>
              <Input
                placeholder={t("enterPropertyId", {
                  defaultValue: "Property ID…",
                })}
                value={filters.externalId}
                onChange={(e) =>
                  setFilters({ ...filters, externalId: e.target.value })
                }
                className="h-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg text-sm"
              />
            </Field>

            <Field label={t("propertyType", { defaultValue: "Property Type" })}>
              <Select
                value={filters.propertyType}
                onValueChange={(v) =>
                  setFilters({ ...filters, propertyType: v })
                }
              >
                <SelectTrigger className="h-10 border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue
                    placeholder={t("allTypes", { defaultValue: "All types" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allTypes", { defaultValue: "All types" })}
                  </SelectItem>
                  {Object.values(PropertyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("dealType", { defaultValue: "Deal Type" })}>
              <Select
                value={filters.dealType}
                onValueChange={(v) => setFilters({ ...filters, dealType: v })}
              >
                <SelectTrigger className="h-10 border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue
                    placeholder={t("allDeals", { defaultValue: "All deals" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allDeals", { defaultValue: "All deals" })}
                  </SelectItem>
                  {Object.values(DealType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("region", { defaultValue: "Region" })}>
              <Select
                value={filters.region}
                onValueChange={(v) => setFilters({ ...filters, region: v })}
              >
                <SelectTrigger className="h-10 border-teal-200 rounded-lg text-sm focus:border-teal-500">
                  <SelectValue
                    placeholder={t("allRegions", {
                      defaultValue: "All regions",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allRegions", { defaultValue: "All regions" })}
                  </SelectItem>
                  {uniqueRegions.map(({ region, regionName }) => (
                    <SelectItem key={region} value={region}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="border-t border-teal-100" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>
                  {t("priceRange", { defaultValue: "Price range" })}
                </FieldLabel>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {filters.priceFrom > 0 || filters.priceTo < MAX_PRICE
                    ? `$${filters.priceFrom.toLocaleString()} – $${filters.priceTo.toLocaleString()}`
                    : t("any", { defaultValue: "Any" })}
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
                <span>${MAX_PRICE.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>
                  {t("area", { defaultValue: "Area (m²)" })}
                </FieldLabel>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {filters.areaFrom > 0 || filters.areaTo < MAX_AREA
                    ? `${filters.areaFrom} – ${filters.areaTo} m²`
                    : t("any", { defaultValue: "Any" })}
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
                <span>{MAX_AREA} m²</span>
              </div>
            </div>

            {!isLandSelected && (
              <>
                <div className="border-t border-teal-100" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("rooms", { defaultValue: "Rooms" })}>
                    <Select
                      value={filters.rooms}
                      onValueChange={(v) =>
                        setFilters({ ...filters, rooms: v })
                      }
                    >
                      <SelectTrigger className="h-10 border-teal-200 rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("any", { defaultValue: "Any" })}
                        </SelectItem>
                        {["1", "2", "3", "4", "5"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n === "5" ? "5+" : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label={t("bedrooms", { defaultValue: "Bedrooms" })}>
                    <Select
                      value={filters.bedrooms}
                      onValueChange={(v) =>
                        setFilters({ ...filters, bedrooms: v })
                      }
                    >
                      <SelectTrigger className="h-10 border-teal-200 rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("any", { defaultValue: "Any" })}
                        </SelectItem>
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
              {t("apply", { defaultValue: "Apply Filters" })}
            </button>
          </div>
        </SheetContent>
      </Sheet>
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
