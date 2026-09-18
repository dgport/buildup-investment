"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutGrid, Map as MapIcon, SearchX } from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";
import { Pagination } from "@/components/shared/Pagination";
import ProjectCard from "@/components/shared/ProjectCard";
import { CardGridSkeleton } from "@/components/shared/Skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectFilters as Filters } from "@/lib/types/projects";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectsMap } from "./ProjectsMap";

const PER_PAGE = 12;
const SORTS = ["featured", "newest", "price_asc", "price_desc", "delivery"] as const;

function parse(params: URLSearchParams): Filters {
  const get = (k: string) => params.get(k) ?? undefined;
  const int = (k: string) => {
    const v = get(k);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  };
  const sort = get("sort");
  return {
    page: Math.max(1, int("page") ?? 1),
    limit: PER_PAGE,
    search: get("search"),
    region: get("region"),
    developer: get("developer"),
    status: get("status"),
    rooms: int("rooms"),
    pricePerSqmFrom: int("pricePerSqmFrom"),
    pricePerSqmTo: int("pricePerSqmTo"),
    deliveryYear: int("deliveryYear"),
    sort: SORTS.includes(sort as (typeof SORTS)[number]) ? (sort as Filters["sort"]) : undefined,
  };
}

export function ProjectsContent() {
  const t = useTranslations("projects");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parse(searchParams);
  const view = searchParams.get("view") === "map" ? "map" : "list";

  const { data, isLoading, error } = useProjects({ ...filters, lang: locale });
  const projects = data?.data ?? [];
  const meta = data?.meta;

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
              <p className="text-teal-100/70 mt-2 max-w-2xl">{t("subtitle")}</p>
            </div>
            <p className="text-sm text-teal-100/70">{meta ? t("count", { count: meta.total }) : "\u00a0"}</p>
          </div>
          <ProjectFilters />
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-500">{meta ? t("count", { count: meta.total }) : ""}</p>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select
              value={filters.sort ?? "featured"}
              onValueChange={(v) => setParam("sort", v === "featured" ? undefined : v)}
            >
              <SelectTrigger aria-label={t("sort")} className="h-10 w-full sm:w-[190px] border-slate-200 rounded-xl text-sm bg-white">
                <SelectValue placeholder={t("sort")} />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`sortOptions.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setParam("view")}
                aria-pressed={view === "list"}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition ${
                  view === "list" ? "bg-teal-900 text-white" : "text-teal-800 hover:bg-teal-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t("viewList")}
              </button>
              <button
                type="button"
                onClick={() => setParam("view", "map")}
                aria-pressed={view === "map"}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition ${
                  view === "map" ? "bg-teal-900 text-white" : "text-teal-800 hover:bg-teal-50"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                {t("viewMap")}
              </button>
            </div>
          </div>
        </div>

        {view === "map" ? (
          <ProjectsMap />
        ) : isLoading ? (
          <CardGridSkeleton count={8} tall />
        ) : error ? (
          <div className="flex justify-center py-24">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
              <p className="text-red-600 font-medium">{t("error")}</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">{t("empty")}</p>
            <p className="text-sm text-gray-400">{t("emptyHint")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
