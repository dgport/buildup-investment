"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, ExternalLink, Flame, ImageIcon, Pencil, RotateCcw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useDeleteProperty, usePropertiesAdmin, useSetPropertyStatus, useUpdateProperty } from "@/lib/hooks/useProperties";
import { useAdminStats } from "@/lib/hooks/useAdmin";
import { PropertyStatus, type Property } from "@/lib/types/properties";
import { propertySiteUrl, parseMarket } from "@/lib/market";
import { MarketTabs } from "@/components/shared/MarketTabs";
import { ROUTES } from "@/lib/constants/routes";
import { thumbnailUrl } from "@/lib/utils/image-utils";
import { formatUsd } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { AdminCard, EmptyRow, FilterChips, PageHeader, StatusPill, formatDate } from "../_components/AdminUi";
import { RejectDialog } from "../_components/RejectDialog";

const STATUSES = ["", PropertyStatus.PENDING, PropertyStatus.APPROVED, PropertyStatus.REJECTED, PropertyStatus.DRAFT] as const;

export default function AdminListingsPage() {
  const t = useTranslations("admin");
  const tp = useTranslations("properties");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const confirm = useConfirm();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const status = (searchParams.get("status") ?? "") as (typeof STATUSES)[number];
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading, isFetching } = usePropertiesAdmin({
    lang: locale,
    page,
    limit: 20,
    status: status || undefined,
    search: search.trim() || undefined,
    sort: "newest",
    market: parseMarket(searchParams.get("market")),
  });
  const { data: stats } = useAdminStats(locale);
  const setStatus = useSetPropertyStatus();
  const update = useUpdateProperty();
  const remove = useDeleteProperty();
  const rows = data?.data ?? [];

  const navigate = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      toast.success(success);
    } catch (e) {
      toast.error(getErrorMessage(e, t("common.saveError")));
    }
  };

  const titleOf = (p: Property) => p.translation?.title || `#${p.externalId}`;
  const counts = stats?.properties;

  return (
    <div className="space-y-5">
      <PageHeader title={t("listings.title")} subtitle={t("listings.subtitle")} />
      <MarketTabs />

      <div className="flex flex-wrap items-center gap-3">
        <FilterChips
          value={status}
          onChange={(v) => navigate({ status: v || undefined })}
          options={STATUSES.map((s) => ({
            value: s,
            label: s ? tp(`enums.status.${s}`) : t("leads.all"),
            count: counts ? (s ? counts[s.toLowerCase() as keyof typeof counts] : counts.total) : undefined,
          }))}
        />
        <form
          className="relative w-full sm:w-72 sm:ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: search.trim() || undefined });
          }}
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("listings.searchPlaceholder")} className="pl-9 bg-white" />
        </form>
      </div>

      <AdminCard className={isFetching && !isLoading ? "opacity-70 transition" : ""}>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyRow>{t("listings.empty")}</EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-teal-700/70">
                <tr>
                  <th className="text-left px-4 py-3">{t("listings.columns.listing")}</th>
                  <th className="text-left px-4 py-3">{t("listings.columns.owner")}</th>
                  <th className="text-left px-4 py-3">{t("listings.columns.price")}</th>
                  <th className="text-left px-4 py-3">{t("listings.columns.status")}</th>
                  <th className="text-left px-4 py-3">{t("listings.columns.created")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p) => {
                  const cover = thumbnailUrl(p.galleryImages?.[0]?.imageUrl);
                  const title = titleOf(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 align-top">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[260px]">
                          <Link href={ROUTES.PROPERTY_EDIT(p.id)} className="w-16 h-12 rounded-md bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300 relative">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={cover} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                            {p.hotSale && <Flame className="absolute top-1 left-1 w-3.5 h-3.5 text-red-500 drop-shadow" />}
                          </Link>
                          <div className="min-w-0">
                            <Link href={ROUTES.PROPERTY_EDIT(p.id)} className="font-semibold text-teal-950 truncate block max-w-[280px] hover:text-amber-600">
                              {title}
                            </Link>
                            <p className="text-xs text-gray-500 truncate">
                              #{p.externalId} · {tp(`enums.propertyType.${p.propertyType}`)} · {tp(`enums.dealType.${p.dealType}`)}
                              {p.regionName ? ` · ${p.regionName}` : ""}
                              {!p.public ? ` · ${t("common.unpublished")}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-teal-900">
                        {p.user ? (
                          <>
                            <p className="font-medium">{p.user.firstname} {p.user.lastname}</p>
                            <p className="text-xs text-gray-500">{p.user.email ?? p.user.phone ?? ""}</p>
                          </>
                        ) : (
                          <span className="text-gray-400">{t("common.none")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-teal-950 whitespace-nowrap">{p.price ? formatUsd(p.price) : t("common.none")}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={p.status} label={tp(`enums.status.${p.status}`)} />
                        {p.status === PropertyStatus.REJECTED && p.rejectionReason && (
                          <p className="text-[11px] text-red-600 mt-1 max-w-[200px] line-clamp-2">{p.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(p.createdAt, locale)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status !== PropertyStatus.APPROVED && (
                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" disabled={setStatus.isPending} onClick={() => run(() => setStatus.mutateAsync({ id: p.id, data: { status: PropertyStatus.APPROVED } }), t("listings.approved"))}>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {t("listings.approve")}
                            </Button>
                          )}
                          {p.status !== PropertyStatus.REJECTED && (
                            <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" disabled={setStatus.isPending} onClick={() => setRejecting({ id: p.id, title })}>
                              <X className="w-3.5 h-3.5 mr-1" />
                              {t("listings.reject")}
                            </Button>
                          )}
                          {p.status === PropertyStatus.REJECTED && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={t("listings.requeue")} title={t("listings.requeue")} disabled={setStatus.isPending} onClick={() => run(() => setStatus.mutateAsync({ id: p.id, data: { status: PropertyStatus.PENDING } }), t("common.saved"))}>
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-8 w-8 ${p.hotSale ? "text-red-500" : "text-gray-400"}`}
                            aria-label={t("listings.toggleHot")}
                            title={t("listings.toggleHot")}
                            disabled={update.isPending}
                            onClick={() => run(() => update.mutateAsync({ id: p.id, data: { hotSale: !p.hotSale } }), t("common.saved"))}
                          >
                            <Flame className="w-4 h-4" />
                          </Button>
                          {p.status === PropertyStatus.APPROVED && p.public && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label={t("common.view")}>
                              <Link href={propertySiteUrl(p)} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label={t("common.edit")}>
                            <Link href={ROUTES.PROPERTY_EDIT(p.id)}><Pencil className="w-4 h-4" /></Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            aria-label={t("common.delete")}
                            disabled={remove.isPending}
                            onClick={async () =>
                              (await confirm({ description: t("listings.deleteConfirm"), destructive: true })) &&
                              run(() => remove.mutateAsync(p.id), t("common.deleted"))
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={data.meta.totalPages} hasNextPage={data.meta.hasNextPage} hasPreviousPage={data.meta.hasPreviousPage} />
        </div>
      )}

      <RejectDialog
        target={rejecting}
        onClose={() => setRejecting(null)}
        pending={setStatus.isPending}
        onConfirm={async (reason) => {
          if (!rejecting) return;
          await run(() => setStatus.mutateAsync({ id: rejecting.id, data: { status: PropertyStatus.REJECTED, rejectionReason: reason } }), t("listings.rejected"));
          setRejecting(null);
        }}
      />
    </div>
  );
}
