"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAdminProjects, useProjectMutations } from "@/lib/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { formatUsd } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";
import { getErrorMessage } from "@/lib/api/api";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useSearchParams } from "next/navigation";

export default function AdminProjectsPage() {
  const t = useTranslations("admin");
  const tp = useTranslations("projects");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const { data, isLoading } = useAdminProjects({ lang: locale, page, limit: 20, search: search || undefined, sort: "newest" });
  const { remove, update } = useProjectMutations();
  const projects = data?.data ?? [];

  const act = async (fn: () => Promise<unknown>, fallback: string, success?: string) => {
    setError(null);
    try {
      await fn();
      if (success) toast.success(success);
    } catch (e) {
      const message = getErrorMessage(e, fallback);
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-teal-950">{t("projects.title")}</h1>
        <Button asChild className="bg-teal-900 hover:bg-teal-800">
          <Link href={ROUTES.ADMIN_PROJECT_NEW}><Plus className="w-4 h-4 mr-2" />{t("projects.new")}</Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search")} className="pl-9" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : projects.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-500">{t("projects.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-teal-700/70">
                <tr>
                  <th className="text-left px-4 py-3">{t("projects.columns.project")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.developer")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.status")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.price")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.delivery")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.leads")}</th>
                  <th className="text-left px-4 py-3">{t("projects.columns.visibility")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((p) => {
                  const cover = resolveImageUrl(p.coverImage);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <Link href={ROUTES.ADMIN_PROJECT_EDIT(p.id)} className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-14 h-10 rounded-md bg-slate-100 overflow-hidden shrink-0">
                            {cover && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={cover} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-teal-950 truncate">{p.title ?? p.slug}</p>
                            <p className="text-xs text-gray-500 truncate">/{p.slug}{p.hotSale ? " · HOT" : ""}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-teal-900">{p.developer.name}</td>
                      <td className="px-4 py-3"><span className="text-xs font-medium bg-teal-50 text-teal-800 rounded-md px-2 py-1">{tp(`status.${p.status}`)}</span></td>
                      <td className="px-4 py-3 font-semibold text-teal-950">{p.pricePerSqmFrom ? formatUsd(p.pricePerSqmFrom) : t("common.none")}</td>
                      <td className="px-4 py-3">{p.deliveryYear ? (p.deliveryQuarter ? `Q${p.deliveryQuarter} ` : "") + p.deliveryYear : t("common.none")}</td>
                      <td className="px-4 py-3">{p.leadsCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => act(() => update.mutateAsync({ id: p.id, data: { published: !p.published } }), t("common.saveError"), t("common.saved"))}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-1 border ${p.published ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                        >
                          {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {p.published ? t("common.published") : t("common.unpublished")}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.published && (
                            <Button variant="ghost" size="icon" asChild aria-label={t("common.view")}>
                              <Link href={ROUTES.PROJECT(p.slug)} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild aria-label={t("common.edit")}>
                            <Link href={ROUTES.ADMIN_PROJECT_EDIT(p.id)}><Pencil className="w-4 h-4" /></Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            aria-label={t("common.delete")}
                            disabled={remove.isPending}
                            onClick={async () => (await confirm({ description: t("projects.deleteConfirm"), destructive: true })) && act(() => remove.mutateAsync(p.id), t("common.deleteError"), t("common.deleted"))}
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
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={data.meta.totalPages} hasNextPage={data.meta.hasNextPage} hasPreviousPage={data.meta.hasPreviousPage} />
        </div>
      )}
    </div>
  );
}
