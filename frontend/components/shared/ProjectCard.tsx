"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, CalendarClock, ImageIcon, Layers, MapPin } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { formatUsd } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";
import type { Project } from "@/lib/types/projects";

const STATUS_STYLES: Record<string, string> = {
  PLANNED: "bg-sky-500/90 text-white",
  UNDER_CONSTRUCTION: "bg-amber-400 text-teal-950",
  COMPLETED: "bg-emerald-500 text-white",
};

export function roomsLabel(
  t: ReturnType<typeof useTranslations<"projects">>,
  rooms: number,
): string {
  if (rooms === 0) return t("rooms.studio");
  if (rooms >= 4) return t("rooms.plus");
  return t("rooms.n", { count: rooms });
}

export default function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("projects");
  const cover = resolveImageUrl(project.coverImage);
  const logo = resolveImageUrl(project.developer.logo);
  const title = project.title || project.slug;
  const delivery =
    project.deliveryYear &&
    (project.deliveryQuarter
      ? t("quarter", { q: project.deliveryQuarter, year: project.deliveryYear })
      : String(project.deliveryYear));

  return (
    <Link
      href={ROUTES.PROJECT(project.slug)}
      className="group block bg-white rounded-2xl border-2 border-teal-900/20 hover:border-amber-400/70 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full"
    >
      <div className="relative h-56 bg-teal-950/5 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-teal-900/30">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">{t("noImage")}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-teal-950/80 to-transparent" />

        {project.hotSale && (
          <div className="absolute top-3 right-[-34px] rotate-45 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black tracking-widest px-10 py-1 shadow-md">
            {t("hotSale")}
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow ${STATUS_STYLES[project.status] ?? ""}`}
        >
          {t(`status.${project.status}`)}
        </span>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-bold text-lg leading-tight truncate drop-shadow">
              {title}
            </p>
            <p className="text-amber-100/80 text-xs flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {[project.regionName, project.address].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={project.developer.name}
              className="w-11 h-11 rounded-lg bg-white object-contain p-1 shadow shrink-0"
            />
          ) : (
            <span className="shrink-0 bg-white/90 text-teal-950 text-[11px] font-semibold px-2 py-1 rounded-lg max-w-[40%] truncate">
              {project.developer.name}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-teal-700/70 font-semibold">
              {t("detail.pricePerSqm")}
            </p>
            <p className="text-xl font-bold text-teal-950">
              {project.pricePerSqmFrom
                ? t("priceFromSqm", { price: formatUsd(project.pricePerSqmFrom) })
                : t("priceOnRequest")}
            </p>
          </div>
          {project.priceFrom ? (
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-teal-700/70 font-semibold">
                {t("detail.priceFrom")}
              </p>
              <p className="text-base font-bold text-amber-600">
                {t("priceFrom", { price: formatUsd(project.priceFrom) })}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-teal-800 pt-3 border-t border-teal-900/10">
          {delivery && (
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
              {t("card.delivery")}: {delivery}
            </span>
          )}
          {project.floors ? (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              {t("card.floors", { count: project.floors })}
            </span>
          ) : null}
          {project.totalApartments ? (
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              {t("card.apartments", { count: project.totalApartments })}
            </span>
          ) : null}
        </div>

        {project.summary.roomOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.summary.roomOptions.map((r) => (
              <span
                key={r}
                className="text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-100 rounded-md px-2 py-0.5"
              >
                {roomsLabel(t, r)}
              </span>
            ))}
            {project.summary.areaFrom ? (
              <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-100 rounded-md px-2 py-0.5">
                {t("card.areaFrom", { area: project.summary.areaFrom })}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}
