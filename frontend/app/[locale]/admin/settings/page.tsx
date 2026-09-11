"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSettings } from "@/lib/hooks/useAdmin";
import { getErrorMessage } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminCard, PageHeader } from "../_components/AdminUi";

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const { data, isLoading } = useSiteSettings();
  const update = useUpdateSiteSettings();

  const [phone, setPhone] = useState<string | null>(null);
  const phoneValue = phone ?? data?.default_contact_phone ?? "";
  const moderation = data?.listing_moderation === "on";

  const save = async (patch: Parameters<typeof update.mutateAsync>[0]) => {
    try {
      await update.mutateAsync(patch);
      toast.success(t("common.saved"));
    } catch (e) {
      toast.error(getErrorMessage(e, t("common.saveError")));
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {isLoading || !data ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          <AdminCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-teal-900 text-amber-300 p-2.5 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-teal-950">{t("settings.moderation.title")}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t("settings.moderation.description")}</p>
                  </div>
                  <Switch
                    checked={moderation}
                    disabled={update.isPending}
                    onCheckedChange={(v) => save({ listing_moderation: v ? "on" : "off" })}
                    aria-label={t("settings.moderation.title")}
                  />
                </div>
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${moderation ? "bg-amber-50 border-amber-100 text-amber-800" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                  {moderation ? t("settings.moderation.onHint") : t("settings.moderation.offHint")}
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <form
              className="flex items-start gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                save({ default_contact_phone: phoneValue.trim() || null });
              }}
            >
              <div className="rounded-xl bg-teal-900 text-amber-300 p-2.5 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h2 className="font-bold text-teal-950">{t("settings.phone.title")}</h2>
                  <p className="text-sm text-slate-500 mt-1">{t("settings.phone.description")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="default-phone" className="text-xs text-slate-500">{t("settings.phone.label")}</Label>
                    <Input id="default-phone" value={phoneValue} onChange={(e) => setPhone(e.target.value)} placeholder="+995 5XX XX XX XX" className="mt-1" />
                  </div>
                  <Button type="submit" disabled={update.isPending || phoneValue === (data.default_contact_phone ?? "")} className="bg-teal-900 hover:bg-teal-800">
                    {update.isPending ? t("common.saving") : t("common.save")}
                  </Button>
                </div>
              </div>
            </form>
          </AdminCard>
        </>
      )}
    </div>
  );
}
