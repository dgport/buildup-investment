"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function PhotoOrderControls({ index, total, disabled, onMove }: {
  index: number;
  total: number;
  disabled?: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const t = useTranslations("common.photos");
  return (
    <div className="flex items-center justify-between gap-1 bg-white px-1">
      <button type="button" draggable={false} disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label={t("earlier", { position: index + 1 })}
        className="flex h-11 min-w-0 max-w-11 flex-1 items-center justify-center rounded-lg text-teal-800 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
      <span className="text-[11px] tabular-nums text-slate-500">{index + 1}/{total}</span>
      <button type="button" draggable={false} disabled={disabled || index === total - 1} onClick={() => onMove(1)} aria-label={t("later", { position: index + 1 })}
        className="flex h-11 min-w-0 max-w-11 flex-1 items-center justify-center rounded-lg text-teal-800 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}
