"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BedDouble, ChevronLeft, ChevronRight, ImageIcon, Layers, Ruler } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { formatAreaRange, formatRange, formatUsd } from "@/lib/utils/format";
import { roomsLabel } from "@/components/shared/ProjectCard";
import type { UnitType } from "@/lib/types/projects";

const AVAILABILITY_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  LIMITED: "bg-amber-100 text-amber-800 border-amber-200",
  SOLD_OUT: "bg-gray-200 text-gray-600 border-gray-300",
};

interface Props {
  unit: UnitType;
  onAsk?: (unit: UnitType) => void;
  onOpenImage?: (images: string[], index: number) => void;
}

export function UnitTypeCard({ unit, onAsk, onOpenImage }: Props) {
  const t = useTranslations("projects");
  const tp = useTranslations("properties");
  const [index, setIndex] = useState(0);
  const images = unit.images
    .map((i) => resolveImageUrl(i.imageUrl))
    .filter((s): s is string => !!s);
  const soldOut = unit.availability === "SOLD_OUT";
  const floors = formatRange(unit.floorsFrom, unit.floorsTo);

  return (
    <div
      className={`card overflow-hidden flex flex-col ${
        soldOut ? "opacity-70" : ""
      }`}
    >
      <div className="relative h-52 bg-slate-50">
        {images.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[index]}
            alt={unit.title ?? roomsLabel(t, unit.rooms)}
            className="w-full h-full object-contain cursor-zoom-in"
            onClick={() => onOpenImage?.(images, index)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-teal-900/30 gap-1">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">{t("detail.floorPlans")}</span>
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow border border-teal-100"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 text-teal-900" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow border border-teal-100"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-teal-900" />
            </button>
            <span className="absolute top-2 right-2 bg-teal-950/70 text-white text-[11px] px-2 py-0.5 rounded-full">
              {index + 1} / {images.length}
            </span>
          </>
        )}
        <span
          className={`absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${AVAILABILITY_STYLES[unit.availability]}`}
        >
          {t(`availability.${unit.availability}`)}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h4 className="font-bold text-teal-950 text-lg leading-tight">
            {unit.title || roomsLabel(t, unit.rooms)}
          </h4>
          {unit.title && (
            <p className="text-xs text-teal-700/70">{roomsLabel(t, unit.rooms)}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat icon={Ruler} label={t("detail.unitArea")} value={`${formatAreaRange(unit.areaFrom, unit.areaTo)} m²`} />
          {unit.bedrooms != null && (
            <Stat icon={BedDouble} label={tp("fields.bedrooms")} value={String(unit.bedrooms)} />
          )}
          {floors && <Stat icon={Layers} label={t("detail.unitFloors")} value={floors} />}
        </div>

        <div className="flex items-end justify-between gap-2 pt-3 border-t border-teal-50">
          <div>
            {unit.pricePerSqm ? (
              <p className="text-xs text-teal-700/70">
                <span className="font-semibold text-teal-900">{formatUsd(unit.pricePerSqm)}</span>{" "}
                {t("detail.unitPricePerSqm")}
              </p>
            ) : null}
            <p className="text-lg font-bold text-amber-600">
              {unit.priceFrom ? t("priceFrom", { price: formatUsd(unit.priceFrom) }) : t("priceOnRequest")}
            </p>
          </div>
          {unit.availableCount != null && !soldOut && (
            <span className="text-[11px] text-teal-700 bg-teal-50 border border-teal-100 rounded-md px-2 py-1">
              {t("detail.unitAvailable", { count: unit.availableCount })}
            </span>
          )}
        </div>

        {unit.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{unit.description}</p>
        )}

        {onAsk && !soldOut && (
          <button
            type="button"
            onClick={() => onAsk(unit)}
            className="mt-auto text-sm font-semibold text-teal-800 hover:text-amber-600 text-left transition-colors"
          >
            {t("detail.askAboutUnit")} →
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-teal-50/60 rounded-lg px-2.5 py-1.5">
      <Icon className="w-4 h-4 text-teal-600 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-teal-700/60">{label}</p>
        <p className="text-sm font-semibold text-teal-950 truncate">{value}</p>
      </div>
    </div>
  );
}
