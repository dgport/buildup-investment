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

export function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="pb-2 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
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
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        {...props}
        aria-invalid={!!error}
        className={cn("bg-white", className)}
      />
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
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        {...props}
        aria-invalid={!!error}
        className={cn("bg-white resize-none", className)}
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
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value || (clearLabel ? NONE : undefined)}
        onValueChange={(v) => onValueChange(v === NONE ? "" : v)}
      >
        <SelectTrigger
          aria-invalid={!!error}
          className={cn("bg-white w-full", error && "border-red-400")}
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
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
        active
          ? activeClass
          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
