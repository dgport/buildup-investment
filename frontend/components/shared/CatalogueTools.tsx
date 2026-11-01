"use client";
import { useState } from "react";
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
  const [sharing, setSharing] = useState(false);
  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("copied"));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error(t("copyError"));
    } finally { setSharing(false); }
  };
  return <button type="button" onClick={share} disabled={sharing} className="inline-flex whitespace-nowrap shrink-0 min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-teal-900 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"><Share2 aria-hidden className="h-4 w-4" />{t("share")}</button>;
}
export function CatalogueRecovery({ onRetry }: { onRetry?: () => void }) {
  const { params, clear } = useFilterActions(); const t = useTranslations("common.catalogue");
  const filtered = filterKeys.some((key) => params.has(key)) || Number(params.get("page")) > 1;
  if (!onRetry && !filtered) return null;
  return <div className="mt-5 flex flex-wrap justify-center gap-3">
    {onRetry && <button type="button" onClick={onRetry} className="inline-flex whitespace-nowrap shrink-0 min-h-11 items-center gap-2 rounded-xl bg-teal-900 px-5 text-sm font-semibold text-white hover:bg-teal-800"><RotateCcw aria-hidden className="h-4 w-4" />{t("retry")}</button>}
    {filtered && <button type="button" onClick={() => clear()} className="min-h-11 rounded-xl border border-teal-200 bg-white px-5 text-sm font-semibold text-teal-900 hover:bg-teal-50">{t("clear")}</button>}
  </div>;
}

/** Clarify that edited filters have not changed the visible results yet. */
export function FilterDraftNotice({ onApply, onReset }: { onApply: () => void; onReset: () => void }) {
  const t = useTranslations("common.catalogue");
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-50 px-3 py-2 text-teal-950">
    <p role="status" className="w-full min-w-0 sm:w-auto sm:flex-1 text-sm font-medium">{t("draft")}</p>
    <button type="button" onClick={onApply} className="whitespace-nowrap shrink-0 min-h-11 rounded-lg bg-teal-900 px-4 text-sm font-semibold text-white">{t("apply")}</button>
    <button type="button" onClick={onReset} className="whitespace-nowrap shrink-0 min-h-11 rounded-lg px-3 text-sm font-semibold hover:bg-amber-100">{t("undo")}</button>
  </div>;
}
