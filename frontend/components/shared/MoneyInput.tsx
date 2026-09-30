"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";

/** Form/API values remain whole USD; only the editor's presentation is converted. */
export function MoneyInput({ value, onValueChange, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | "" | null | undefined;
  onValueChange: (usd: number | "") => void;
}) {
  const { currency, exchangeRate } = useCurrency();
  const [draft, setDraft] = useState<{ raw: string; usd: number | ""; currency: string; rate: number } | null>(null);
  const shown = draft && draft.usd === value && draft.currency === currency && draft.rate === exchangeRate
    ? draft.raw
    : value == null || value === "" ? "" : String(Math.round(value * (currency === "GEL" ? exchangeRate : 1)));
  return <Input {...props} type="number" min={0} step={1} inputMode="numeric" value={shown} onChange={(event) => {
    const raw = event.target.value;
    const usd = raw === "" ? "" : Math.round(Number(raw) / (currency === "GEL" ? exchangeRate : 1));
    setDraft({ raw, usd, currency, rate: exchangeRate });
    onValueChange(usd);
  }} />;
}

export function MoneyField({ label, value, onValueChange, error }: {
  label: string;
  value: number | "" | null | undefined;
  onValueChange: (usd: number | "") => void;
  error?: string;
}) {
  const { currency, exchangeRate } = useCurrency();
  return <label className="block min-w-0 space-y-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-800/80">{label} ({currency})</span>
    <MoneyInput value={value} onValueChange={onValueChange} aria-label={`${label} (${currency})`} aria-invalid={!!error} className="h-11 rounded-xl bg-slate-50" />
    {error ? <span className="block text-xs text-red-500">{error}</span> : value != null && value !== "" ? <span className="block text-xs text-slate-500">≈ {currency === "GEL" ? `$${value.toLocaleString("en-US")}` : `${Math.round(value * exchangeRate).toLocaleString("en-US")} ₾`}</span> : null}
  </label>;
}
