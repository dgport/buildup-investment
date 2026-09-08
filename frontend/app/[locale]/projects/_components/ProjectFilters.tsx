"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Region } from "@/lib/types/properties";
import { ProjectStatus } from "@/lib/types/projects";
import { useDevelopers } from "@/lib/hooks/useProjects";
import { roomsLabel } from "@/components/shared/ProjectCard";

const ALL = "all";
const MAX_SQM = 5000;
const STEP_SQM = 100;
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

interface State {
  search: string;
  region: string;
  developer: string;
  status: string;
  rooms: string;
  sqmFrom: number;
  sqmTo: number;
  year: string;
}

const read = (p: URLSearchParams): State => ({
  search: p.get("search") ?? "",
  region: p.get("region") ?? ALL,
  developer: p.get("developer") ?? ALL,
  status: p.get("status") ?? ALL,
  rooms: p.get("rooms") ?? ALL,
  sqmFrom: Number(p.get("pricePerSqmFrom") ?? 0) || 0,
  sqmTo: Number(p.get("pricePerSqmTo") ?? MAX_SQM) || MAX_SQM,
  year: p.get("deliveryYear") ?? ALL,
});

const EMPTY: State = {
  search: "",
  region: ALL,
  developer: ALL,
  status: ALL,
  rooms: ALL,
  sqmFrom: 0,
  sqmTo: MAX_SQM,
  year: ALL,
};

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
  // Re-sync when the URL changes (back button, clear) – adjust state during render
  const [syncedParams, setSyncedParams] = useState(searchParams);
  if (syncedParams !== searchParams) {
    setSyncedParams(searchParams);
    setState(read(searchParams));
  }

  const active = [
    state.search.trim() !== "",
    state.region !== ALL,
    state.developer !== ALL,
    state.status !== ALL,
    state.rooms !== ALL,
    state.sqmFrom > 0,
    state.sqmTo < MAX_SQM,
    state.year !== ALL,
  ].filter(Boolean).length;

  const apply = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    if (state.search.trim()) params.set("search", state.search.trim());
    if (state.region !== ALL) params.set("region", state.region);
    if (state.developer !== ALL) params.set("developer", state.developer);
    if (state.status !== ALL) params.set("status", state.status);
    if (state.rooms !== ALL) params.set("rooms", state.rooms);
    if (state.sqmFrom > 0) params.set("pricePerSqmFrom", String(state.sqmFrom));
    if (state.sqmTo < MAX_SQM) params.set("pricePerSqmTo", String(state.sqmTo));
    if (state.year !== ALL) params.set("deliveryYear", state.year);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setState(EMPTY);
    router.push(`${pathname}?page=1`);
    setOpen(false);
  };

  const selectCls = "h-10 w-full border-teal-200 rounded-lg text-sm bg-white";

  return (
    <div className="flex items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 hover:border-teal-400 transition-all text-teal-900 font-medium text-sm shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            <span>{t("filters.title")}</span>
            {active > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-teal-950 text-xs font-bold leading-none">
                {active}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-full sm:w-[480px] flex flex-col p-0 border-r border-teal-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-teal-100 bg-teal-950">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-400 rounded-lg">
                <SlidersHorizontal className="w-4 h-4 text-teal-950" />
              </div>
              <SheetTitle className="text-white font-semibold text-base m-0">
                {t("filters.heading")}
              </SheetTitle>
            </div>
            {active > 0 && (
              <button onClick={clear} className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-amber-400 font-medium">
                <X className="w-3.5 h-3.5" />
                {t("filters.clear")}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <Field label={t("filters.search")}>
              <Input
                value={state.search}
                onChange={(e) => setState({ ...state, search: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && apply()}
                placeholder={t("filters.searchPlaceholder")}
                className="h-10 border-teal-200 rounded-lg text-sm"
              />
            </Field>

            <Field label={t("filters.region")}>
              <Select value={state.region} onValueChange={(v) => setState({ ...state, region: v })}>
                <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("filters.allRegions")}</SelectItem>
                  {Object.values(Region).map((r) => (
                    <SelectItem key={r} value={r}>{tp(`enums.region.${r}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("filters.developer")}>
              <Select value={state.developer} onValueChange={(v) => setState({ ...state, developer: v })}>
                <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("filters.allDevelopers")}</SelectItem>
                  {developers.map((d) => (
                    <SelectItem key={d.id} value={d.slug}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("filters.status")}>
              <Select value={state.status} onValueChange={(v) => setState({ ...state, status: v })}>
                <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
                  {Object.values(ProjectStatus).map((s) => (
                    <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t("filters.rooms")}>
                <Select value={state.rooms} onValueChange={(v) => setState({ ...state, rooms: v })}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("filters.anyRooms")}</SelectItem>
                    {[0, 1, 2, 3, 4].map((r) => (
                      <SelectItem key={r} value={String(r)}>{roomsLabel(t, r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("filters.deliveryYear")}>
                <Select value={state.year} onValueChange={(v) => setState({ ...state, year: v })}>
                  <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t("filters.anyYear")}</SelectItem>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("filters.pricePerSqm")}</Label>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {state.sqmFrom > 0 || state.sqmTo < MAX_SQM
                    ? `$${state.sqmFrom.toLocaleString()} – $${state.sqmTo.toLocaleString()}`
                    : t("filters.any")}
                </span>
              </div>
              <Slider
                min={0}
                max={MAX_SQM}
                step={STEP_SQM}
                value={[state.sqmFrom, state.sqmTo]}
                onValueChange={([from, to]) => setState({ ...state, sqmFrom: from, sqmTo: to })}
                className="[&_[role=slider]]:bg-teal-900 [&_[role=slider]]:border-teal-900 [&_.range]:bg-teal-700"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>$0</span>
                <span>${MAX_SQM.toLocaleString()}+</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-teal-100 bg-white">
            <button
              onClick={apply}
              className="w-full h-11 rounded-xl bg-teal-900 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              {t("filters.apply")}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {active > 0 && (
        <button onClick={clear} className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:text-red-600 transition-colors">
          <X className="w-4 h-4" />
          {t("filters.clear")}
        </button>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wide text-teal-700">{children}</label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
