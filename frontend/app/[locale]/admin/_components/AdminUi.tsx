"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate as formatDateBase, formatDateTime } from "@/lib/utils/format";

/** Page title row used by every admin screen. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-teal-950">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "teal",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  href?: string;
  tone?: "teal" | "amber" | "red" | "sky";
}) {
  const tones = {
    teal: "bg-teal-900 text-amber-300",
    amber: "bg-amber-400 text-teal-950",
    red: "bg-red-500 text-white",
    sky: "bg-sky-600 text-white",
  } as const;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("rounded-xl p-2.5 shadow-sm", tones[tone])}>{icon}</div>
        {href && <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-teal-700 transition" />}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-teal-950 tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </>
  );
  const className = "card p-5 block group";
  return href ? (
    <Link href={href} className={cn(className, "card-hover")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value || "all"}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition",
            value === o.value
              ? "bg-teal-900 text-white border-teal-900 shadow"
              : "bg-white text-teal-900 border-teal-200 hover:border-teal-400",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-xs opacity-70 tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  NEW: "bg-amber-100 text-amber-800 border-amber-200",
  CONTACTED: "bg-sky-100 text-sky-800 border-sky-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  ADMIN: "bg-teal-100 text-teal-800 border-teal-200",
  REGULAR: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusPill({ status, label, className }: { status: string; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        STATUS_TONES[status] ?? STATUS_TONES.DRAFT,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>{children}</div>;
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="p-12 text-center text-sm text-gray-500">{children}</p>;
}

/** Avatar initials — Georgian letters are left as-is (Mtavruli capitals look foreign). */
export function initials(...names: (string | null | undefined)[]) {
  return names
    .map((n) => (n ?? "").trim().slice(0, 1))
    .filter(Boolean)
    .map((c) => (/[ა-ჿ]/.test(c) ? c : c.toUpperCase()))
    .join("");
}

export function formatDate(value: string | Date, locale: string, withTime = false) {
  return withTime ? formatDateTime(value, locale) : formatDateBase(value, locale, "medium");
}
