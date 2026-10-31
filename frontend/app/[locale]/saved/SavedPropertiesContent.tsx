"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Heart, ArrowRight, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import PropertyCard from "@/components/shared/PropertyCard";
import { CardGridSkeleton, CardSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
import { useSavedProperties, toggleSavedProperty } from "@/lib/hooks/useSavedProperties";
import { propertiesService } from "@/lib/services/properties.service";
import { propertyKeys } from "@/lib/hooks/useProperties";
import { ROUTES } from "@/lib/constants/routes";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export function SavedPropertiesContent() {
  const t = useTranslations("common.saved");
  const locale = useLocale();
  const { ids, ready } = useSavedProperties();
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const visibleIds = ids.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const listings = useQueries({ queries: visibleIds.map((id) => ({
    queryKey: propertyKeys.detail(id, locale),
    queryFn: async () => (await propertiesService.getById(id, locale)).data,
    retry: false,
  })) });

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-[70svh] bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-teal-950"><Heart className="h-7 w-7 shrink-0 text-rose-500" />{t("title")}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("privacy")}</p>
            {ready && ids.length > 0 && <p className="mt-2 text-sm font-semibold text-teal-800">{t("count", { count: ids.length })}</p>}
          </div>
          <Button asChild variant="outline"><Link href={ROUTES.PROPERTIES}>{t("browse")}<ArrowRight className="h-4 w-4" /></Link></Button>
        </div>

        {!ready ? <CardGridSkeleton count={3} /> : ids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-900/20 bg-white px-5 py-16 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-rose-200" />
            <h2 className="text-xl font-semibold text-teal-950">{t("empty")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t("emptyHint")}</p>
            <Button asChild className="mt-6"><Link href={ROUTES.PROPERTIES}>{t("browse")}</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing, index) => {
              const id = visibleIds[index];
              if (listing.isPending) return <CardSkeleton key={id} />;
              if (listing.data && !listing.error) return <PropertyCard key={id} property={listing.data} />;
              const missing = (listing.error as { response?: { status?: number } } | null)?.response?.status === 404;
              return (
                <div key={id} className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <p className="text-sm text-slate-600">{t(missing ? "unavailable" : "loadError")}</p>
                  {!missing && <Button variant="outline" onClick={() => void listing.refetch()} disabled={listing.isFetching}><RefreshCw className="h-4 w-4" />{t("retry")}</Button>}
                  <Button variant="ghost" onClick={() => {
                    const result = toggleSavedProperty(id);
                    if (result === "unavailable") toast.error(t("storageError"));
                  }}><Trash2 className="h-4 w-4" />{t("remove")}</Button>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && <nav aria-label={t("pages")} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}>{t("previous")}</Button>
          <span className="text-sm text-slate-600" aria-live="polite">{t("page", { page, total: totalPages })}</span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>{t("next")}</Button>
        </nav>}
      </div>
    </div>
  );
}
