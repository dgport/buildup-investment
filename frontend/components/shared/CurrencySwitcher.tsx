"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/currency";

export function CurrencySwitcher({ dark = false }: { dark?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const t = useTranslations("properties.filters");
  return (
    <div role="group" aria-label={t("currency")} className={`inline-flex shrink-0 gap-0.5 rounded-lg p-1 ${dark ? "bg-white/10" : "bg-slate-100"}`}>
      {(["GEL", "USD"] as const).map((value) => (
        <button key={value} type="button" aria-pressed={currency === value} onClick={() => setCurrency(value)} className={`cursor-pointer rounded-md px-2 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 ${currency === value ? "bg-amber-400 text-teal-950" : dark ? "text-white/80 hover:bg-white/10" : "text-teal-900 hover:bg-white"}`}>
          {value === "GEL" ? "₾ GEL" : "$ USD"}
        </button>
      ))}
    </div>
  );
}
