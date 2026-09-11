"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Hash, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DealType, PropertyType, Region } from "@/lib/types/properties";

const ALL = "all";

interface FilterState {
  propertyType: string;
  dealType: string;
  region: string;
  externalId: string;
  priceFrom: string;
  priceTo: string;
  areaFrom: string;
  areaTo: string;
  rooms: string;
  bedrooms: string;
}

const FILTER_KEYS = [
  "propertyType",
  "dealType",
  "region",
  "externalId",
  "priceFrom",
  "priceTo",
  "areaFrom",
  "areaTo",
  "rooms",
  "bedrooms",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const readFilters = (params: URLSearchParams): FilterState => ({
  propertyType: params.get("propertyType") ?? ALL,
  dealType: params.get("dealType") ?? ALL,
  region: params.get("region") ?? ALL,
  externalId: params.get("externalId") ?? "",
  priceFrom: params.get("priceFrom") ?? "",
  priceTo: params.get("priceTo") ?? "",
  areaFrom: params.get("areaFrom") ?? "",
  areaTo: params.get("areaTo") ?? "",
  rooms: params.get("rooms") ?? ALL,
  bedrooms: params.get("bedrooms") ?? ALL,
});

const isSet = (key: FilterKey, value: string) =>
  ["propertyType", "dealType", "region", "rooms", "bedrooms"].includes(key) ? value !== ALL : value.trim() !== "";

const digits = (v: string) => v.replace(/[^\d]/g, "");

const control =
  "h-11 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50 text-sm text-teal-950 hover:bg-white focus:bg-white focus:border-teal-500 [&>span]:truncate";

/** Inline search toolbar + "more filters" sheet + removable active-filter chips. */
export function PropertyFilters() {
  const t = useTranslations("properties");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [moreOpen, setMoreOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => readFilters(searchParams));
  const applied = readFilters(searchParams);

  // Follow URL changes (back button, chip removal, hero search links)
  useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  const set = <K extends FilterKey>(key: K, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const isLand = filters.propertyType === PropertyType.LAND;

  const push = (next: FilterState) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    for (const key of FILTER_KEYS) {
      const value = next[key].trim();
      if (!isSet(key, value)) continue;
      if (isLand && (key === "rooms" || key === "bedrooms")) continue;
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setMoreOpen(false);
  };

  const apply = () => push(filters);
  const clearAll = () => {
    const empty = readFilters(new URLSearchParams());
    setFilters(empty);
    push(empty);
  };
  const removeChip = (key: FilterKey) => {
    const next = { ...applied, [key]: ["propertyType", "dealType", "region", "rooms", "bedrooms"].includes(key) ? ALL : "" };
    setFilters(next);
    push(next);
  };

  const moreCount = (["externalId", "areaFrom", "areaTo", "bedrooms"] as FilterKey[]).filter((k) => isSet(k, filters[k])).length;

  const chipLabel = (key: FilterKey, value: string) => {
    switch (key) {
      case "propertyType":
        return t(`enums.propertyType.${value as PropertyType}`);
      case "dealType":
        return t(`enums.dealType.${value as DealType}`);
      case "region":
        return t(`enums.region.${value as Region}`);
      case "externalId":
        return `ID ${value}`;
      case "priceFrom":
        return `$${Number(value).toLocaleString()}+`;
      case "priceTo":
        return `≤ $${Number(value).toLocaleString()}`;
      case "areaFrom":
        return `${value}+ m²`;
      case "areaTo":
        return `≤ ${value} m²`;
      case "rooms":
        return `${t("fields.rooms")}: ${value === "5" ? "5+" : value}`;
      case "bedrooms":
        return `${t("fields.bedrooms")}: ${value === "4" ? "4+" : value}`;
    }
  };
  const chips = FILTER_KEYS.filter((k) => isSet(k, applied[k]));

  const onEnter = (e: React.KeyboardEvent) => e.key === "Enter" && apply();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/25 ring-1 ring-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_auto_auto] gap-2 items-stretch">
          {/* Deal type segmented control */}
          <div className="col-span-2 md:col-span-4 xl:col-span-1 grid grid-cols-2 sm:flex rounded-xl bg-slate-100 p-1 gap-0.5">
            {[ALL, ...Object.values(DealType)].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set("dealType", d)}
                className={`sm:flex-1 xl:flex-none px-3 h-9 rounded-lg text-[13px] sm:text-sm font-semibold whitespace-nowrap transition ${
                  filters.dealType === d ? "bg-teal-900 text-white shadow" : "text-teal-900 hover:bg-white"
                }`}
              >
                {d === ALL ? t("filters.dealAll") : t(`enums.dealType.${d as DealType}`)}
              </button>
            ))}
          </div>

          <Select value={filters.propertyType} onValueChange={(v) => set("propertyType", v)}>
            <SelectTrigger className={control} aria-label={t("propertyType")}>
              <SelectValue placeholder={t("allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allTypes")}</SelectItem>
              {Object.values(PropertyType).map((type) => (
                <SelectItem key={type} value={type}>{t(`enums.propertyType.${type}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.region} onValueChange={(v) => set("region", v)}>
            <SelectTrigger className={control} aria-label={t("region")}>
              <SelectValue placeholder={t("allRegions")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allRegions")}</SelectItem>
              {Object.values(Region).map((region) => (
                <SelectItem key={region} value={region}>{t(`enums.region.${region}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price range */}
          <div className="col-span-2 md:col-span-2 xl:col-span-1 flex items-center h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 gap-1.5 focus-within:bg-white focus-within:border-teal-500">
            <span className="text-sm font-semibold text-slate-400">$</span>
            <input
              inputMode="numeric"
              value={filters.priceFrom}
              onChange={(e) => set("priceFrom", digits(e.target.value))}
              onKeyDown={onEnter}
              placeholder={t("filters.priceFrom")}
              aria-label={t("filters.priceFrom")}
              className="w-full min-w-0 bg-transparent text-sm text-teal-950 placeholder:text-slate-400 outline-none"
            />
            <span className="text-slate-300">–</span>
            <input
              inputMode="numeric"
              value={filters.priceTo}
              onChange={(e) => set("priceTo", digits(e.target.value))}
              onKeyDown={onEnter}
              placeholder={t("filters.priceTo")}
              aria-label={t("filters.priceTo")}
              className="w-full min-w-0 bg-transparent text-sm text-teal-950 placeholder:text-slate-400 outline-none"
            />
          </div>

          <Select value={isLand ? ALL : filters.rooms} onValueChange={(v) => set("rooms", v)} disabled={isLand}>
            <SelectTrigger className={control} aria-label={t("fields.rooms")}>
              <SelectValue placeholder={t("fields.rooms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("fields.rooms")}: {t("any")}</SelectItem>
              {["1", "2", "3", "4", "5"].map((n) => (
                <SelectItem key={n} value={n}>{t("fields.rooms")}: {n === "5" ? "5+" : n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More filters */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-teal-900 hover:bg-slate-50 inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                {t("filters.more")}
                {moreCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-teal-950 text-[11px] font-bold flex items-center justify-center">
                    {moreCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-teal-950">
                <SheetTitle className="text-white font-semibold text-base m-0">{t("filters.moreTitle")}</SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <Field label={t("propertyId")}>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={filters.externalId}
                      onChange={(e) => set("externalId", digits(e.target.value))}
                      onKeyDown={onEnter}
                      placeholder={t("enterPropertyId")}
                      className="h-11 pl-9 rounded-xl bg-slate-50"
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("filters.areaFrom")}>
                    <Input inputMode="numeric" value={filters.areaFrom} onChange={(e) => set("areaFrom", digits(e.target.value))} onKeyDown={onEnter} placeholder="0" className="h-11 rounded-xl bg-slate-50" />
                  </Field>
                  <Field label={t("filters.areaTo")}>
                    <Input inputMode="numeric" value={filters.areaTo} onChange={(e) => set("areaTo", digits(e.target.value))} onKeyDown={onEnter} placeholder="500" className="h-11 rounded-xl bg-slate-50" />
                  </Field>
                </div>
                {!isLand && (
                  <Field label={t("fields.bedrooms")}>
                    <div className="flex gap-2">
                      {[ALL, "1", "2", "3", "4"].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => set("bedrooms", n)}
                          className={`flex-1 h-10 rounded-xl border text-sm font-semibold transition ${
                            filters.bedrooms === n ? "bg-teal-900 text-white border-teal-900" : "bg-white text-teal-900 border-slate-200 hover:border-teal-400"
                          }`}
                        >
                          {n === ALL ? t("any") : n === "4" ? "4+" : n}
                        </button>
                      ))}
                    </div>
                  </Field>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
                <button type="button" onClick={clearAll} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  {t("clear")}
                </button>
                <button type="button" onClick={apply} className="flex-1 h-11 rounded-xl bg-teal-900 hover:bg-teal-800 text-white font-semibold text-sm inline-flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  {t("apply")}
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={apply}
            className="col-span-2 md:col-span-2 xl:col-span-1 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold text-sm px-5 inline-flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            {t("filters.search")}
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {chips.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => removeChip(key)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium pl-3 pr-2 py-1.5 transition"
            >
              {chipLabel(key, applied[key])}
              <X className="w-3 h-3 opacity-70" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-2">
            {t("clear")}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-800/80">{label}</label>
      {children}
    </div>
  );
}
