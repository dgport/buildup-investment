"use client";

import { useState, useMemo, useEffect } from "react";
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
  const t = useTranslations("filters");
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

  // Fetch all properties once to extract unique regions with translated names
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

  return (
    <div className="mb-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-2 hover:border-blue-400 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">
              {t("title", { defaultValue: "Filters" })}
            </span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {t("active", { defaultValue: "Active" })}
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
              {t("propertyFilters", { defaultValue: "Property Filters" })}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* ID search */}
            <FilterSection
              label={t("propertyId", { defaultValue: "Property ID" })}
              color="bg-orange-500"
            >
              <Input
                placeholder={t("enterPropertyId", {
                  defaultValue: "Enter property ID…",
                })}
                value={filters.externalId}
                onChange={(e) =>
                  setFilters({ ...filters, externalId: e.target.value })
                }
                className="h-10 border-2 focus:border-orange-500"
              />
            </FilterSection>

            {/* Property type */}
            <FilterSection
              label={t("propertyType", { defaultValue: "Property Type" })}
              color="bg-blue-500"
            >
              <Select
                value={filters.propertyType}
                onValueChange={(v) =>
                  setFilters({ ...filters, propertyType: v })
                }
              >
                <SelectTrigger className="h-10 border-2">
                  <SelectValue
                    placeholder={t("allTypes", { defaultValue: "All Types" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allTypes", { defaultValue: "All Types" })}
                  </SelectItem>
                  {Object.values(PropertyType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Deal type */}
            <FilterSection
              label={t("dealType", { defaultValue: "Deal Type" })}
              color="bg-blue-400"
            >
              <Select
                value={filters.dealType}
                onValueChange={(v) => setFilters({ ...filters, dealType: v })}
              >
                <SelectTrigger className="h-10 border-2">
                  <SelectValue
                    placeholder={t("allDeals", { defaultValue: "All Deals" })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allDeals", { defaultValue: "All Deals" })}
                  </SelectItem>
                  {Object.values(DealType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumValue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Region */}
            <FilterSection
              label={t("region", { defaultValue: "Region" })}
              color="bg-teal-500"
            >
              <Select
                value={filters.region}
                onValueChange={(v) => setFilters({ ...filters, region: v })}
              >
                <SelectTrigger className="h-10 border-2">
                  <SelectValue
                    placeholder={t("allRegions", {
                      defaultValue: "All Regions",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("allRegions", { defaultValue: "All Regions" })}
                  </SelectItem>
                  {uniqueRegions.map(({ region, regionName }) => (
                    <SelectItem key={region} value={region}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Price range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FilterLabel color="bg-blue-500">
                  {t("priceRange", { defaultValue: "Price Range" })}
                </FilterLabel>
                <span className="text-sm font-bold text-blue-600">
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
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded-full">$0</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">
                  ${MAX_PRICE.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Area range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FilterLabel color="bg-purple-500">
                  {t("area", { defaultValue: "Area (m²)" })}
                </FilterLabel>
                <span className="text-sm font-bold text-purple-600">
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
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-0.5 rounded-full">0 m²</span>
                <span className="bg-muted px-2 py-0.5 rounded-full">
                  {MAX_AREA} m²
                </span>
              </div>
            </div>

            {/* Rooms & bedrooms */}
            {!isLandSelected && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("rooms", { defaultValue: "Rooms" })}
                  </Label>
                  <Select
                    value={filters.rooms}
                    onValueChange={(v) => setFilters({ ...filters, rooms: v })}
                  >
                    <SelectTrigger className="h-10 border-2">
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
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("bedrooms", { defaultValue: "Bedrooms" })}
                  </Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(v) =>
                      setFilters({ ...filters, bedrooms: v })
                    }
                  >
                    <SelectTrigger className="h-10 border-2">
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
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-2 border-t">
              <Button
                onClick={applyFilters}
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 font-semibold"
              >
                <Search className="w-4 h-4 mr-2" />
                {t("apply", { defaultValue: "Apply Filters" })}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-10 border-2 font-semibold hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t("clear", { defaultValue: "Clear All Filters" })}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSection({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FilterLabel color={color}>{label}</FilterLabel>
      {children}
    </div>
  );
}

function FilterLabel({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
      <div className={`w-0.5 h-4 ${color} rounded-full`} />
      {children}
    </Label>
  );
}
