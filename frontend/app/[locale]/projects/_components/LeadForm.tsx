"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLead } from "@/lib/hooks/useProjects";
import { getErrorMessage } from "@/lib/api/api";
import { toast } from "sonner";
import type { UnitType } from "@/lib/types/projects";
import { roomsLabel } from "@/components/shared/ProjectCard";
import { formatAreaRange } from "@/lib/utils/format";

const ANY = "__any__";

interface LeadFormProps {
  projectId: string;
  unitTypes: UnitType[];
  /** Pre-selected unit type (when opened from a unit card) */
  initialUnitTypeId?: string | null;
  onSuccess?: () => void;
}

export function LeadForm({ projectId, unitTypes, initialUnitTypeId, onSuccess }: LeadFormProps) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const createLead = useCreateLead();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    unitTypeId: initialUnitTypeId ?? ANY,
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = t("lead.nameRequired");
    if (!/^[+\d][\d\s()-]{6,24}$/.test(form.phone.trim())) next.phone = t("lead.phoneInvalid");
    setErrors(next);
    if (Object.keys(next).length) return;

    setServerError(null);
    try {
      await createLead.mutateAsync({
        projectId,
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          message: form.message.trim() || undefined,
          unitTypeId: form.unitTypeId === ANY ? undefined : form.unitTypeId,
          locale,
          website: form.website || undefined,
        },
      });
      setDone(true);
      toast.success(t("lead.success"));
      onSuccess?.();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(status === 429 ? t("lead.tooMany") : getErrorMessage(err, t("lead.error")));
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-teal-950 font-medium">{t("lead.success")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-teal-800/70">{t("lead.subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t("lead.name")} <span className="text-red-500">*</span></Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("lead.namePlaceholder")}
            aria-invalid={!!errors.name}
            maxLength={100}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>{t("lead.phone")} <span className="text-red-500">*</span></Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder={t("lead.phonePlaceholder")}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{t("lead.email")}</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        {unitTypes.length > 0 && (
          <div className="space-y-1.5">
            <Label>{t("lead.unitType")}</Label>
            <Select value={form.unitTypeId} onValueChange={(v) => set("unitTypeId", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>{t("lead.anyUnit")}</SelectItem>
                {unitTypes.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.title || roomsLabel(t, u.rooms)} · {formatAreaRange(u.areaFrom, u.areaTo)} m²
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{t("lead.message")}</Label>
        <Textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder={t("lead.messagePlaceholder")}
          rows={3}
          maxLength={2000}
        />
      </div>

      {/* honeypot: hidden from humans */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={submit}
        disabled={createLead.isPending}
        className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold"
      >
        <Send className="w-4 h-4 mr-2" />
        {createLead.isPending ? t("lead.sending") : t("lead.submit")}
      </Button>
    </div>
  );
}
