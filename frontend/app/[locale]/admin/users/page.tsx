"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, Mail, Phone, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAdminUsers, useUpdateAdminUser } from "@/lib/hooks/useAdmin";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import type { AdminUser } from "@/lib/types/admin";
import type { UserRole } from "@/lib/types/auth";
import { getErrorMessage } from "@/lib/api/api";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { AdminCard, EmptyRow, FilterChips, PageHeader, StatusPill, formatDate, initials } from "../_components/AdminUi";

const ROLES = ["", "ADMIN", "REGULAR"] as const;

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const { data: me } = useCurrentUser();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const role = (searchParams.get("role") ?? "") as (typeof ROLES)[number];
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const { data, isLoading, isFetching } = useAdminUsers({ page, limit: 25, role: (role || undefined) as UserRole | undefined, search: search.trim() || undefined });
  const update = useUpdateAdminUser();
  const users = data?.data ?? [];
  const counts = data?.meta.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  const navigate = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const change = async (u: AdminUser, patch: { role?: UserRole; isActive?: boolean }) => {
    if (patch.role === "ADMIN" && !(await confirm({ description: t("users.promoteConfirm", { name: `${u.firstname} ${u.lastname}` }) }))) return;
    if (patch.isActive === false && !(await confirm({ description: t("users.deactivateConfirm", { name: `${u.firstname} ${u.lastname}` }), destructive: true }))) return;
    try {
      await update.mutateAsync({ id: u.id, data: patch });
      toast.success(t("common.saved"));
    } catch (e) {
      toast.error(getErrorMessage(e, t("common.saveError")));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title={t("users.title")} subtitle={t("users.subtitle", { total })} />

      <div className="flex flex-wrap items-center gap-3">
        <FilterChips
          value={role}
          onChange={(v) => navigate({ role: v || undefined })}
          options={ROLES.map((r) => ({ value: r, label: r ? t(`users.roles.${r}`) : t("leads.all"), count: r ? (counts[r] ?? 0) : total }))}
        />
        <form
          className="relative w-full sm:w-72 sm:ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: search.trim() || undefined });
          }}
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("users.searchPlaceholder")} className="pl-9 bg-white" />
        </form>
      </div>

      <AdminCard className={isFetching && !isLoading ? "opacity-70 transition" : ""}>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : users.length === 0 ? (
          <EmptyRow>{t("users.empty")}</EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-teal-700/70">
                <tr>
                  <th className="text-left px-4 py-3">{t("users.columns.user")}</th>
                  <th className="text-left px-4 py-3">{t("users.columns.contact")}</th>
                  <th className="text-left px-4 py-3">{t("users.columns.role")}</th>
                  <th className="text-left px-4 py-3">{t("users.columns.listings")}</th>
                  <th className="text-left px-4 py-3">{t("users.columns.joined")}</th>
                  <th className="text-left px-4 py-3">{t("users.columns.active")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/60 ${!u.isActive ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-9 h-9 rounded-full bg-teal-900 text-amber-300 font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                            {u.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              initials(u.firstname, u.lastname)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-teal-950 truncate flex items-center gap-1.5">
                              {u.firstname} {u.lastname}
                              {u.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-teal-600" aria-label={t("users.verified")} />}
                              {isMe && <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded px-1">{t("users.you")}</span>}
                            </p>
                            <p className="text-xs text-gray-500">{u.method === "GOOGLE" ? "Google" : t("users.password")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <a href={`mailto:${u.email}`} className="flex items-center gap-1 text-teal-800 hover:text-amber-600 truncate max-w-[220px]"><Mail className="w-3 h-3 shrink-0" />{u.email}</a>
                        {u.phone && <a href={`tel:${u.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 text-teal-800 hover:text-amber-600 mt-0.5"><Phone className="w-3 h-3" />{u.phone}</a>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={update.isPending || isMe}
                          onChange={(e) => change(u, { role: e.target.value as UserRole })}
                          className={`text-xs font-semibold rounded-md px-2 py-1.5 border ${u.role === "ADMIN" ? "bg-teal-100 text-teal-800 border-teal-200" : "bg-slate-100 text-slate-700 border-slate-200"} disabled:opacity-70`}
                        >
                          <option value="REGULAR">{t("users.roles.REGULAR")}</option>
                          <option value="ADMIN">{t("users.roles.ADMIN")}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{u.propertiesCount}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(u.createdAt, locale)}
                        {u.lastLogin && <p className="text-[11px] text-gray-400">{t("users.lastLogin")}: {formatDate(u.lastLogin, locale)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={u.isActive} disabled={update.isPending || isMe} onCheckedChange={(v) => change(u, { isActive: v })} aria-label={t("users.columns.active")} />
                          {!u.isActive && <StatusPill status="REJECTED" label={t("users.blocked")} />}
                          {u.role === "ADMIN" && u.isActive && <ShieldCheck className="w-4 h-4 text-teal-600" />}
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
    </div>
  );
}
