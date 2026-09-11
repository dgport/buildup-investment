"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Phone, Trash2 } from "lucide-react";
import { useLeadMutations, useLeads } from "@/lib/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { LeadStatus, type Lead } from "@/lib/types/projects";
import { ROUTES } from "@/lib/constants/routes";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { roomsLabel } from "@/components/shared/ProjectCard";
import { useSearchParams } from "next/navigation";
import { formatDateTime } from "@/lib/utils/format";
import { FilterChips, PageHeader } from "../_components/AdminUi";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800 border-amber-200",
  CONTACTED: "bg-sky-100 text-sky-800 border-sky-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminLeadsPage() {
  const t = useTranslations("admin");
  const tp = useTranslations("projects");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useLeads({ page, limit: 20, status: status || undefined });
  const m = useLeadMutations();
  const confirm = useConfirm();
  const leads = data?.data ?? [];
  const counts = data?.meta.counts ?? {};

  return (
    <div className="space-y-5">
      <PageHeader title={t("leads.title")} subtitle={t("leads.subtitle")} />

      <FilterChips
        value={status}
        onChange={setStatus}
        options={["", ...Object.values(LeadStatus)].map((s) => ({
          value: s,
          label: s ? t(`leads.status.${s as LeadStatus}`) : t("leads.all"),
          count: s ? (counts[s as LeadStatus] ?? 0) : Object.values(counts).reduce((a, b) => a + (b ?? 0), 0),
        }))}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : leads.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-500">{t("leads.empty")}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} locale={locale} onChange={(d) => m.update.mutateAsync({ id: lead.id, data: d }).then(() => toast.success(t("common.saved")))} onDelete={async () => (await confirm({ description: t("leads.deleteConfirm"), destructive: true })) && m.remove.mutateAsync(lead.id)} roomsLabel={(r) => roomsLabel(tp, r)} />
            ))}
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

function LeadRow({
  lead,
  locale,
  onChange,
  onDelete,
  roomsLabel,
}: {
  lead: Lead;
  locale: string;
  onChange: (data: { status?: string; note?: string }) => Promise<unknown>;
  onDelete: () => void;
  roomsLabel: (rooms: number) => string;
}) {
  const t = useTranslations("admin");
  const [note, setNote] = useState(lead.note ?? "");

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-[150px_1fr_1fr_1fr_auto] gap-3 items-start">
      <div className="text-xs text-gray-500">
        {formatDateTime(lead.createdAt, locale)}
        <div className="mt-1 uppercase tracking-wide text-[10px]">{lead.locale}</div>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-teal-950">{lead.name}</p>
        <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="text-sm text-teal-800 hover:text-amber-600 flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</a>
        {lead.email && <a href={`mailto:${lead.email}`} className="text-sm text-teal-800 hover:text-amber-600 flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{lead.email}</a>}
      </div>
      <div className="min-w-0 text-sm">
        <Link href={ROUTES.PROJECT(lead.project.slug)} target="_blank" className="font-medium text-teal-900 hover:text-amber-600 truncate block">{lead.project.title}</Link>
        {lead.unitType && <p className="text-xs text-gray-500">{lead.unitType.title || roomsLabel(lead.unitType.rooms)} · {lead.unitType.areaFrom} m²</p>}
        {lead.message && <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{lead.message}</p>}
      </div>
      <div className="space-y-2">
        <select
          value={lead.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className={`text-xs font-medium rounded-md px-2 py-1.5 border ${STATUS_STYLES[lead.status]}`}
        >
          {Object.values(LeadStatus).map((s) => (
            <option key={s} value={s}>{t(`leads.status.${s}`)}</option>
          ))}
        </select>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (lead.note ?? "") && onChange({ note })}
          placeholder={t("leads.notePlaceholder")}
          rows={2}
          className="w-full text-xs rounded-md border border-gray-200 px-2 py-1.5 resize-none focus:outline-none focus:border-teal-500"
        />
      </div>
      <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 justify-self-end" aria-label={t("common.delete")} onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
