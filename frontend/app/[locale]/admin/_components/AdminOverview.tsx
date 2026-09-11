"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Building2, Check, Flame, Home, Inbox, ImageIcon, Phone, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminStats } from "@/lib/hooks/useAdmin";
import { useSetPropertyStatus } from "@/lib/hooks/useProperties";
import { PropertyStatus } from "@/lib/types/properties";
import { ROUTES } from "@/lib/constants/routes";
import { thumbnailUrl } from "@/lib/utils/image-utils";
import { formatUsd } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminCard, EmptyRow, PageHeader, StatCard, StatusPill, formatDate, initials } from "./AdminUi";
import { RejectDialog } from "./RejectDialog";
import { useState } from "react";

export function AdminOverview() {
  const t = useTranslations("admin");
  const tp = useTranslations("properties");
  const locale = useLocale();
  const { data, isLoading } = useAdminStats(locale);
  const setStatus = useSetPropertyStatus();
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null);

  const approve = async (id: string) => {
    try {
      await setStatus.mutateAsync({ id, data: { status: PropertyStatus.APPROVED } });
      toast.success(t("listings.approved"));
    } catch (e) {
      toast.error(getErrorMessage(e, t("common.saveError")));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />

      {isLoading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("overview.listings")}
              value={data.properties.approved}
              hint={t("overview.listingsHint", { pending: data.properties.pending, hot: data.properties.hotSale })}
              icon={<Home className="w-5 h-5" />}
              href={ROUTES.ADMIN_LISTINGS}
              tone={data.properties.pending ? "amber" : "teal"}
            />
            <StatCard
              label={t("overview.leads")}
              value={data.leads.new}
              hint={t("overview.leadsHint", { total: data.leads.total })}
              icon={<Inbox className="w-5 h-5" />}
              href={ROUTES.ADMIN_LEADS}
              tone={data.leads.new ? "red" : "teal"}
            />
            <StatCard
              label={t("overview.projects")}
              value={data.projects.published}
              hint={t("overview.projectsHint", { total: data.projects.total, developers: data.projects.developers })}
              icon={<Building2 className="w-5 h-5" />}
              href={ROUTES.ADMIN_PROJECTS}
            />
            <StatCard
              label={t("overview.users")}
              value={data.users.total}
              hint={t("overview.usersHint", { recent: data.users.newLast30d, admins: data.users.admins })}
              icon={<Users className="w-5 h-5" />}
              href={ROUTES.ADMIN_USERS}
              tone="sky"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending queue */}
            <AdminCard>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-teal-950">{t("overview.pendingTitle")}</h2>
                <Link href={`${ROUTES.ADMIN_LISTINGS}?status=PENDING`} className="text-xs font-semibold text-teal-800 hover:text-amber-600">
                  {t("overview.seeAll")}
                </Link>
              </div>
              {data.recentPending.length === 0 ? (
                <EmptyRow>{t("overview.pendingEmpty")}</EmptyRow>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.recentPending.map((p) => {
                    const cover = thumbnailUrl(p.coverImage);
                    const title = p.title ?? `#${p.externalId}`;
                    return (
                      <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <Link href={ROUTES.PROPERTY_EDIT(p.id)} className="w-14 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5" />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={ROUTES.PROPERTY_EDIT(p.id)} className="font-semibold text-teal-950 text-sm truncate block hover:text-amber-600">
                            {title}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">
                            {tp(`enums.propertyType.${p.propertyType}`)} · {tp(`enums.dealType.${p.dealType}`)}
                            {p.price ? ` · ${formatUsd(p.price)}` : ""}
                            {p.owner ? ` · ${p.owner}` : ""} · {formatDate(p.createdAt, locale)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" aria-label={t("listings.approve")} disabled={setStatus.isPending} onClick={() => approve(p.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" aria-label={t("listings.reject")} disabled={setStatus.isPending} onClick={() => setRejecting({ id: p.id, title })}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </AdminCard>

            {/* Latest leads */}
            <AdminCard>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-teal-950">{t("overview.leadsTitle")}</h2>
                <Link href={ROUTES.ADMIN_LEADS} className="text-xs font-semibold text-teal-800 hover:text-amber-600">
                  {t("overview.seeAll")}
                </Link>
              </div>
              {data.recentLeads.length === 0 ? (
                <EmptyRow>{t("leads.empty")}</EmptyRow>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data.recentLeads.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-800 font-bold text-sm flex items-center justify-center shrink-0">
                        {initials(l.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-teal-950 text-sm truncate">{l.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          <Link href={ROUTES.PROJECT(l.project.slug)} className="hover:text-amber-600">{l.project.title}</Link> · {formatDate(l.createdAt, locale, true)}
                        </p>
                      </div>
                      <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="hidden sm:inline-flex items-center gap-1 text-xs text-teal-800 hover:text-amber-600">
                        <Phone className="w-3 h-3" />
                        {l.phone}
                      </a>
                      <StatusPill status={l.status} label={t(`leads.status.${l.status}`)} />
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
          </div>

          {data.properties.hotSale > 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              {t("overview.hotNote", { count: data.properties.hotSale })}
            </p>
          )}
        </>
      )}

      <RejectDialog
        target={rejecting}
        onClose={() => setRejecting(null)}
        onConfirm={async (reason) => {
          if (!rejecting) return;
          try {
            await setStatus.mutateAsync({ id: rejecting.id, data: { status: PropertyStatus.REJECTED, rejectionReason: reason } });
            toast.success(t("listings.rejected"));
            setRejecting(null);
          } catch (e) {
            toast.error(getErrorMessage(e, t("common.saveError")));
          }
        }}
        pending={setStatus.isPending}
      />
    </div>
  );
}
