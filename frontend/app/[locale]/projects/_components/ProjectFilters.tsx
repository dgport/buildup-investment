"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Region } from "@/lib/types/properties";
import { ProjectStatus } from "@/lib/types/projects";
import { useDevelopers } from "@/lib/hooks/useProjects";
import { roomsLabel } from "@/components/shared/ProjectCard";

const ALL = "all";
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

interface State {
  search: string;
  region: string;
  developer: string;
  status: string;
  rooms: string;
  sqmFrom: string;
  sqmTo: string;
  year: string;
}

const KEYS = ["search", "region", "developer", "status", "rooms", "sqmFrom", "sqmTo", "year"] as const;
type Key = (typeof KEYS)[number];
const PARAM: Record<Key, string> = {
  search: "search",
  region: "region",
  developer: "developer",
  status: "status",
  rooms: "rooms",
  sqmFrom: "pricePerSqmFrom",
  sqmTo: "pricePerSqmTo",
  year: "deliveryYear",
};
const SELECTS: Key[] = ["region", "developer", "status", "rooms", "year"];

const read = (p: URLSearchParams): State => ({
  search: p.get("search") ?? "",
  region: p.get("region") ?? ALL,
  developer: p.get("developer") ?? ALL,
  status: p.get("status") ?? ALL,
  rooms: p.get("rooms") ?? ALL,
  sqmFrom: p.get("pricePerSqmFrom") ?? "",
  sqmTo: p.get("pricePerSqmTo") ?? "",
  year: p.get("deliveryYear") ?? ALL,
});

const isSet = (key: Key, value: string) => (SELECTS.includes(key) ? value !== ALL : value.trim() !== "");
const digits = (v: string) => v.replace(/[^\d]/g, "");
const control =
  "h-11 w-full min-w-0 rounded-xl border-slate-200 bg-slate-50 text-sm text-teal-950 hover:bg-white focus:bg-white focus:border-teal-500 [&>span]:truncate";

/** Inline toolbar + "more" sheet + removable chips, matching the listings page. */
export function ProjectFilters() {
  const t = useTranslations("projects");
  const tp = useTranslations("properties");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: developers = [] } = useDevelopers(locale);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>(() => read(searchParams));
  // Re-sync when the URL changes (back button, chips) – adjust state during render
  const [syncedParams, setSyncedParams] = useState(searchParams);
  if (syncedParams !== searchParams) {
    setSyncedParams(searchParams);
    setState(read(searchParams));
  }
  const applied = read(searchParams);
  const set = (key: Key, value: string) => setState((s) => ({ ...s, [key]: value }));

  const push = (next: State) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    for (const key of KEYS) {
      const value = next[key].trim();
      if (isSet(key, value)) params.set(PARAM[key], value);
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };
  const apply = () => push(state);
  const clear = () => {
    const empty = read(new URLSearchParams());
    setState(empty);
    push(empty);
  };
  const removeChip = (key: Key) => push({ ...applied, [key]: SELECTS.includes(key) ? ALL : "" });

  const moreCount = (["rooms", "year", "sqmFrom", "sqmTo"] as Key[]).filter((k) => isSet(k, state[k])).length;
  const chips = KEYS.filter((k) => isSet(k, applied[k]));
  const chipLabel = (key: Key, value: string) => {
    switch (key) {
      case "search":
        return `„${value}“`;
      case "region":
        return tp(`enums.region.${value as Region}`);
      case "developer":
        return developers.find((d) => d.slug === value)?.name ?? value;
      case "status":
        return t(`status.${value as ProjectStatus}`);
      case "rooms":
        return roomsLabel(t, Number(value));
      case "sqmFrom":
        return `$${Number(value).toLocaleString()}+ / m²`;
      case "sqmTo":
        return `≤ $${Number(value).toLocaleString()} / m²`;
      case "year":
        return `${t("filters.deliveryYear")}: ${value}`;
    }
  };
  const onEnter = (e: React.KeyboardEvent) => e.key === "Enter" && apply();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/25 ring-1 ring-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-2 items-stretch">
          <div className="col-span-2 md:col-span-4 xl:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={state.search}
              onChange={(e) => set("search", e.target.value)}
              onKeyDown={onEnter}
              placeholder={t("filters.searchPlaceholder")}
              aria-label={t("filters.search")}
              className={`${control} pl-10`}
            />
          </div>

          <Select value={state.region} onValueChange={(v) => set("region", v)}>
            <SelectTrigger className={control} aria-label={t("filters.region")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allRegions")}</SelectItem>
              {Object.values(Region).map((r) => (
                <SelectItem key={r} value={r}>{tp(`enums.region.${r}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className={control} aria-label={t("filters.status")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
              {Object.values(ProjectStatus).map((s) => (
                <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.developer} onValueChange={(v) => set("developer", v)}>
            <SelectTrigger className={control} aria-label={t("filters.developer")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allDevelopers")}</SelectItem>
              {developers.map((d) => (
                <SelectItem key={d.id} value={d.slug}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={open} onOpenChange={setOpen}>
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
              <div className="px-6 py-5 border-b border-slate-100 bg-teal-950">
                <SheetTitle className="text-white font-semibold text-base m-0">{t("filters.heading")}</SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <Field label={t("filters.rooms")}>
                  <div className="flex flex-wrap gap-2">
                    {[ALL, "0", "1", "2", "3", "4"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => set("rooms", r)}
                        className={`h-10 px-3.5 rounded-xl border text-sm font-semibold transition ${
                          state.rooms === r ? "bg-teal-900 text-white border-teal-900" : "bg-white text-teal-900 border-slate-200 hover:border-teal-400"
                        }`}
                      >
                        {r === ALL ? t("filters.anyRooms") : roomsLabel(t, Number(r))}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t("filters.deliveryYear")}>
                  <div className="flex flex-wrap gap-2">
                    {[ALL, ...YEARS.map(String)].map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => set("year", y)}
                        className={`h-10 px-3.5 rounded-xl border text-sm font-semibold transition ${
                          state.year === y ? "bg-teal-900 text-white border-teal-900" : "bg-white text-teal-900 border-slate-200 hover:border-teal-400"
                        }`}
                      >
                        {y === ALL ? t("filters.anyYear") : y}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={t("filters.pricePerSqm")}>
                  <div className="grid grid-cols-2 gap-3">
                    <Input inputMode="numeric" value={state.sqmFrom} onChange={(e) => set("sqmFrom", digits(e.target.value))} onKeyDown={onEnter} placeholder={t("filters.priceFrom")} className="h-11 rounded-xl bg-slate-50" />
                    <Input inputMode="numeric" value={state.sqmTo} onChange={(e) => set("sqmTo", digits(e.target.value))} onKeyDown={onEnter} placeholder={t("filters.priceTo")} className="h-11 rounded-xl bg-slate-50" />
                  </div>
                </Field>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
                <button type="button" onClick={clear} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  {t("filters.clear")}
                </button>
                <button type="button" onClick={apply} className="flex-1 h-11 rounded-xl bg-teal-900 hover:bg-teal-800 text-white font-semibold text-sm inline-flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  {t("filters.apply")}
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
            {t("filters.go")}
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
          <button type="button" onClick={clear} className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-2">
            {t("filters.clear")}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-teal-800/80">{label}</label>
      {children}
    </div>
  );
}
