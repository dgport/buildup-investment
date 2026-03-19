"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProperties } from "@/lib/hooks/useProperties";
import { DealType, PropertyType } from "@/lib/types/properties";

const MAX_PRICE = 1_000_000;
const PRICE_STEP = 10_000;
const MAX_AREA = 500;
const AREA_STEP = 10;

function formatEnumValue(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function readInt(searchParams: URLSearchParams, key: string): number | null {
  const v = searchParams.get(key);
  if (!v) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
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

  const { data: allPropertiesResponse } = useProperties({
    lang: locale,
    limit: 1000,
  });

  const uniqueRegions = useMemo(() => {
    if (!allPropertiesResponse?.data) return [];
    const map = new Map<string, string>();
    for (const p of allPropertiesResponse.data) {
      if (p.region && p.regionName) map.set(p.region, p.regionName);
    }
    return Array.from(map.entries())
      .map(([region, regionName]) => ({ region, regionName }))
      .sort((a, b) => a.regionName.localeCompare(b.regionName));
  }, [allPropertiesResponse]);

  const filters = useMemo(
    () => ({
      propertyType: searchParams.get("propertyType") ?? "all",
      dealType: searchParams.get("dealType") ?? "all",
      region: searchParams.get("region") ?? "all",
      externalId: searchParams.get("externalId") ?? "",
      priceFrom: readInt(searchParams, "priceFrom") ?? 0,
      priceTo: readInt(searchParams, "priceTo") ?? MAX_PRICE,
      areaFrom: readInt(searchParams, "areaFrom") ?? 0,
      areaTo: readInt(searchParams, "areaTo") ?? MAX_AREA,
      rooms: searchParams.get("rooms") ?? "all",
      bedrooms: searchParams.get("bedrooms") ?? "all",
    }),
    [searchParams],
  );

  const isLandSelected = filters.propertyType === PropertyType.LAND;

  const hasActiveFilters =
    filters.propertyType !== "all" ||
    filters.dealType !== "all" ||
    filters.region !== "all" ||
    filters.externalId.trim() !== "" ||
    filters.priceFrom > 0 ||
    filters.priceTo < MAX_PRICE ||
    filters.areaFrom > 0 ||
    filters.areaTo < MAX_AREA ||
    filters.rooms !== "all" ||
    filters.bedrooms !== "all";

  const pushParams = useCallback(
    (updates: Record<string, string | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (resetPage) params.set("page", "1");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const applyFilters = useCallback(
    (overrides: Partial<typeof filters> = {}) => {
      const f = { ...filters, ...overrides };
      const updates: Record<string, string | null> = {
        page: "1",
        propertyType: f.propertyType !== "all" ? f.propertyType : null,
        dealType: f.dealType !== "all" ? f.dealType : null,
        region: f.region !== "all" ? f.region : null,
        externalId: f.externalId.trim() || null,
        priceFrom: f.priceFrom > 0 ? String(f.priceFrom) : null,
        priceTo: f.priceTo < MAX_PRICE ? String(f.priceTo) : null,
        areaFrom: f.areaFrom > 0 ? String(f.areaFrom) : null,
        areaTo: f.areaTo < MAX_AREA ? String(f.areaTo) : null,
        rooms: f.rooms !== "all" && !isLandSelected ? f.rooms : null,
        bedrooms: f.bedrooms !== "all" && !isLandSelected ? f.bedrooms : null,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(updates)) {
        if (value !== null) params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.();
    },
    [filters, isLandSelected, router, pathname, onFilterChange],
  );

  const clearFilters = useCallback(() => {
    router.push(`${pathname}?page=1`);
    onFilterChange?.();
  }, [router, pathname, onFilterChange]);

  const handleSliderCommit = useCallback(
    (field: "price" | "area", [from, to]: number[]) => {
      const updates: Record<string, string | null> =
        field === "price"
          ? {
              priceFrom: from > 0 ? String(from) : null,
              priceTo: to < MAX_PRICE ? String(to) : null,
            }
          : {
              areaFrom: from > 0 ? String(from) : null,
              areaTo: to < MAX_AREA ? String(to) : null,
            };
      pushParams(updates);
    },
    [pushParams],
  );

  return (
    <div className="mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-2 hover:border-blue-400 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">{t("filterTitle")}</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t("filterActive")}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full sm:w-[420px] overflow-y-auto z-50"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              {t("filterHeading")}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-0.5 h-4 bg-orange-500 rounded-full" />
                {t("filterSearch")}
              </Label>
              <Input
                type="text"
                placeholder={t("filterSearchPlaceholder")}
                value={filters.externalId}
                onChange={(e) =>
                  pushParams({ externalId: e.target.value.trim() || null })
                }
                className="h-10 border-2 focus:border-orange-500"
                autoFocus={false}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
                {t("filterPropertyType")}
              </Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => {
                  const isLand = value === PropertyType.LAND;
                  pushParams({
                    propertyType: value !== "all" ? value : null,
                    ...(isLand ? { rooms: null, bedrooms: null } : {}),
                  });
                }}
              >
                <SelectTrigger className="h-10 border-2 focus:border-blue-500">
                  <SelectValue
                    placeholder={t("filterPropertyTypePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filterPropertyTypePlaceholder")}
                  </SelectItem>
                  {Object.values(PropertyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-0.5 h-4 bg-blue-400 rounded-full" />
                {t("filterDealType")}
              </Label>
              <Select
                value={filters.dealType}
                onValueChange={(value) =>
                  pushParams({ dealType: value !== "all" ? value : null })
                }
              >
                <SelectTrigger className="h-10 border-2 focus:border-blue-400">
                  <SelectValue placeholder={t("filterDealTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filterDealTypePlaceholder")}
                  </SelectItem>
                  {Object.values(DealType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="w-0.5 h-4 bg-teal-500 rounded-full" />
                {t("filterRegion")}
              </Label>
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  pushParams({ region: value !== "all" ? value : null })
                }
              >
                <SelectTrigger className="h-10 border-2 focus:border-teal-500">
                  <SelectValue placeholder={t("filterRegionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filterRegionPlaceholder")}
                  </SelectItem>
                  {uniqueRegions.map(({ region, regionName }) => (
                    <SelectItem key={region} value={region}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
                  {t("filterPriceRange")}
                </Label>
                <span className="text-sm font-bold text-blue-600">
                  {filters.priceFrom > 0 || filters.priceTo < MAX_PRICE
                    ? `$${filters.priceFrom.toLocaleString()} – $${filters.priceTo.toLocaleString()}`
                    : t("filterAny")}
                </span>
              </div>
              <div className="relative pt-1 pb-3">
                <Slider
                  min={0}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={[filters.priceFrom, filters.priceTo]}
                  onValueChange={([from, to]) =>
                    pushParams({
                      priceFrom: from > 0 ? String(from) : null,
                      priceTo: to < MAX_PRICE ? String(to) : null,
                    })
                  }
                  onValueCommit={([from, to]) =>
                    handleSliderCommit("price", [from, to])
                  }
                  className="w-full [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded-full">$0</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">
                  ${MAX_PRICE.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-purple-500 rounded-full" />
                  {t("filterArea")}
                </Label>
                <span className="text-sm font-bold text-purple-600">
                  {filters.areaFrom > 0 || filters.areaTo < MAX_AREA
                    ? `${filters.areaFrom} – ${filters.areaTo} m²`
                    : t("filterAny")}
                </span>
              </div>
              <div className="relative pt-1 pb-3">
                <Slider
                  min={0}
                  max={MAX_AREA}
                  step={AREA_STEP}
                  value={[filters.areaFrom, filters.areaTo]}
                  onValueChange={([from, to]) =>
                    pushParams({
                      areaFrom: from > 0 ? String(from) : null,
                      areaTo: to < MAX_AREA ? String(to) : null,
                    })
                  }
                  onValueCommit={([from, to]) =>
                    handleSliderCommit("area", [from, to])
                  }
                  className="w-full [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded-full">0 m²</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">
                  {MAX_AREA} m²
                </span>
              </div>
            </div>

            {!isLandSelected && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("filterRooms")}
                  </Label>
                  <Select
                    value={filters.rooms}
                    onValueChange={(value) =>
                      pushParams({ rooms: value !== "all" ? value : null })
                    }
                  >
                    <SelectTrigger className="h-10 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filterAny")}</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("filterBedrooms")}
                  </Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) =>
                      pushParams({ bedrooms: value !== "all" ? value : null })
                    }
                  >
                    <SelectTrigger className="h-10 border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("filterAny")}</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2 border-t">
              <Button
                onClick={() => applyFilters()}
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-sm font-semibold"
                size="lg"
              >
                <Search className="w-4 h-4 mr-2" />
                {t("filterApply")}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-10 border-2 text-sm font-semibold hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  size="lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("filterReset")}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
