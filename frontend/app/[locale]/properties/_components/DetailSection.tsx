"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "teal" | "amber" | "sky" | "violet";

const ACCENTS: Record<Accent, { tile: string; ring: string }> = {
  teal: { tile: "bg-teal-900 text-amber-300", ring: "ring-teal-100" },
  amber: { tile: "bg-amber-400 text-teal-950", ring: "ring-amber-100" },
  sky: { tile: "bg-sky-600 text-white", ring: "ring-sky-100" },
  violet: { tile: "bg-violet-600 text-white", ring: "ring-violet-100" },
};

/**
 * One block of the listing detail page: icon tile, title, optional counter,
 * then the content. Gives every section the same visual weight and rhythm.
 */
export function DetailSection({
  icon: Icon,
  title,
  count,
  accent = "teal",
  action,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  accent?: Accent;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const tone = ACCENTS[accent];
  return (
    <section className={cn("card p-5 sm:p-6", className)}>
      <header className="flex items-center gap-3 mb-4">
        <span className={cn("rounded-xl p-2 shrink-0 shadow-sm", tone.tile)}>
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="font-bold text-teal-950 text-[15px] sm:text-base">{title}</h2>
        {count !== undefined && (
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5 tabular-nums">
            {count}
          </span>
        )}
        {action && <div className="ml-auto">{action}</div>}
        <span className="flex-1 h-px bg-gradient-to-r from-teal-900/10 to-transparent ml-1" />
      </header>
      {children}
    </section>
  );
}

/**
 * Label + value tile with a tinted icon badge – used for the specification
 * grids (area, rooms, heating, …).
 */
export function SpecTile({
  icon: Icon,
  label,
  value,
  accent = "teal",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  accent?: Accent;
}) {
  const badges: Record<Accent, string> = {
    teal: "bg-teal-100 text-teal-800",
    amber: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-teal-900/[0.07] bg-slate-50/70 p-3 transition-colors hover:bg-white hover:border-teal-200">
      <span className={cn("rounded-lg p-2 shrink-0", badges[accent])}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-teal-950 truncate">{value}</p>
      </div>
    </div>
  );
}
