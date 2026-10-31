"use client";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
const filterKeys = ["propertyType", "dealType", "region", "externalId", "priceFrom", "priceTo", "areaFrom", "areaTo", "rooms", "bedrooms", "search", "developer", "status", "pricePerSqmFrom", "pricePerSqmTo", "deliveryYear"];
function useFilterActions() {
  const params = useSearchParams(); const pathname = usePathname(); const router = useRouter();
  const clear = (key?: string) => {
    const next = new URLSearchParams(params.toString());
    for (const field of key ? [key] : filterKeys) next.delete(field);
    next.delete("page");
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  return { params, clear };
}
export function ShareSearch() {
  const t = useTranslations("common.catalogue");
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("copied"));
    } catch { toast.error(t("copyError")); }
  };
  return <button type="button" onClick={share} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-teal-900 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"><Share2 aria-hidden className="h-4 w-4" />{t("share")}</button>;
}
export function CatalogueRecovery({ onRetry }: { onRetry?: () => void }) {
  const { params, clear } = useFilterActions(); const t = useTranslations("common.catalogue");
  const filtered = filterKeys.some((key) => params.has(key)) || Number(params.get("page")) > 1;
  if (!onRetry && !filtered) return null;
  return <div className="mt-5 flex flex-wrap justify-center gap-3">
    {onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-900 px-5 text-sm font-semibold text-white hover:bg-teal-800"><RotateCcw aria-hidden className="h-4 w-4" />{t("retry")}</button>}
    {filtered && <button type="button" onClick={() => clear()} className="min-h-11 rounded-xl border border-teal-200 bg-white px-5 text-sm font-semibold text-teal-900 hover:bg-teal-50">{t("clear")}</button>}
  </div>;
}
