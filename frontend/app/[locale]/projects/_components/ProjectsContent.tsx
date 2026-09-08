"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Building2, LayoutGrid, Map as MapIcon, SearchX } from "lucide-react";
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
  const [view, setView] = useState<"list" | "map">(
    searchParams.get("view") === "map" ? "map" : "list",
  );

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-28 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-900 rounded-xl p-2">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-teal-950">{t("title")}</h1>
          </div>
          <p className="text-teal-800/70 ml-14">{t("subtitle")}</p>
          {meta && (
            <p className="text-sm text-gray-500 ml-14 mt-1">
              {t("count", { count: meta.total })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <ProjectFilters />

          <div className="flex items-center gap-2 ml-auto">
            <Select
              value={filters.sort ?? "featured"}
              onValueChange={(v) => setParam("sort", v === "featured" ? undefined : v)}
            >
              <SelectTrigger className="h-10 w-[190px] border-teal-200 rounded-xl text-sm bg-white">
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

            <div className="inline-flex rounded-xl border border-teal-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition ${
                  view === "list" ? "bg-teal-900 text-white" : "text-teal-800 hover:bg-teal-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t("viewList")}
              </button>
              <button
                type="button"
                onClick={() => setView("map")}
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
