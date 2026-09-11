"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FIELD =
  "h-11 rounded-xl border-slate-200 bg-slate-50 text-teal-950 hover:bg-white focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15";

export function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 h-6 w-1 rounded-full bg-amber-400 shrink-0" />
      <div>
        <h2 className="text-lg font-bold text-teal-950 leading-tight">{children}</h2>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-800/80">
      {label} {required && <span className="text-amber-500">*</span>}
    </Label>
  );
}

export function FieldInput({
  label,
  required,
  error,
  className,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} required={required} />
      <Input {...props} aria-invalid={!!error} className={cn(FIELD, className)} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FieldTextarea({
  label,
  required,
  error,
  className,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} required={required} />
      <Textarea
        {...props}
        aria-invalid={!!error}
        className={cn(
          "rounded-xl border-slate-200 bg-slate-50 text-teal-950 hover:bg-white focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 resize-none",
          className,
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function FieldSelect({
  label,
  options,
  placeholder,
  value,
  onValueChange,
  required,
  error,
  clearLabel,
}: {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  error?: string;
  /** When given, an extra option that resets the value to "" is shown. */
  clearLabel?: string;
}) {
  const NONE = "__none__";
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} required={required} />
      <Select
        value={value || (clearLabel ? NONE : undefined)}
        onValueChange={(v) => onValueChange(v === NONE ? "" : v)}
      >
        <SelectTrigger
          aria-invalid={!!error}
          className={cn(FIELD, "w-full", error && "border-red-400")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {clearLabel && (
            <SelectItem value={NONE} className="text-gray-400">
              {clearLabel}
            </SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ToggleChip({
  icon,
  label,
  active,
  activeClass,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeClass: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      aria-pressed={active}
      className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-sm font-semibold transition-all ${
        active ? activeClass : "bg-slate-50 border-slate-200 text-slate-500 hover:border-teal-300 hover:bg-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
