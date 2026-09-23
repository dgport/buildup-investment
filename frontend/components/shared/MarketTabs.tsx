"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function MarketTabs() {
  const t = useTranslations("common.market");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const market = params.get("market") ?? "";

  return (
    <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label={t("label")}>
      {[["", "all"], ["sale", "sales"], ["rent", "rentals"]].map(([value, label]) => (
        <button key={value} type="button" aria-pressed={market === value}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${market === value ? "bg-teal-900 text-white border-teal-900" : "bg-white text-teal-900 border-teal-200"}`}
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            if (value) next.set("market", value); else next.delete("market");
            next.set("page", "1");
            router.push(`${pathname}?${next}`);
          }}>
          {t(label)}
        </button>
      ))}
    </div>
  );
}
