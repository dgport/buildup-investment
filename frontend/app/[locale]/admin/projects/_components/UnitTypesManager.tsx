"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldInput, FieldSelect, FieldTextarea } from "@/app/[locale]/properties/_components/form/FormPrimitives";
import { PROPERTY_LANGUAGES, type PropertyLanguage } from "@/lib/types/properties";
import { UnitAvailability, type Project, type UnitType, type UnitTypeInput } from "@/lib/types/projects";
import { useProjectMutations } from "@/lib/hooks/useProjects";
import { getErrorMessage } from "@/lib/api/api";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { formatAreaRange, formatUsd } from "@/lib/utils/format";
import { roomsLabel } from "@/components/shared/ProjectCard";
import { AdminImageGallery } from "../../_components/AdminImageGallery";

type FormState = Required<Pick<UnitTypeInput, "availability">> & Omit<UnitTypeInput, "availability">;

const EMPTY: FormState = {
  availability: UnitAvailability.AVAILABLE,
  rooms: "",
  bedrooms: "",
  areaFrom: "",
  areaTo: "",
  pricePerSqm: "",
  priceFrom: "",
  floorsFrom: "",
  floorsTo: "",
  availableCount: "",
  sortOrder: "",
  titleKa: "",
  titleEn: "",
  titleRu: "",
  descriptionKa: "",
  descriptionEn: "",
  descriptionRu: "",
};

const toForm = (u: UnitType): FormState => {
  const tr = (l: string) => u.translations?.find((x) => x.language === l);
  return {
    availability: u.availability,
    rooms: u.rooms,
    bedrooms: u.bedrooms ?? "",
    areaFrom: u.areaFrom,
    areaTo: u.areaTo ?? "",
    pricePerSqm: u.pricePerSqm ?? "",
    priceFrom: u.priceFrom ?? "",
    floorsFrom: u.floorsFrom ?? "",
    floorsTo: u.floorsTo ?? "",
    availableCount: u.availableCount ?? "",
    sortOrder: u.sortOrder,
    titleKa: tr("ka")?.title ?? "",
    titleEn: tr("en")?.title ?? "",
    titleRu: tr("ru")?.title ?? "",
    descriptionKa: tr("ka")?.description ?? "",
    descriptionEn: tr("en")?.description ?? "",
    descriptionRu: tr("ru")?.description ?? "",
  };
};

const TITLE_KEY: Record<PropertyLanguage, keyof FormState> = { ka: "titleKa", en: "titleEn", ru: "titleRu" };
const DESC_KEY: Record<PropertyLanguage, keyof FormState> = { ka: "descriptionKa", en: "descriptionEn", ru: "descriptionRu" };
const num = (v: number | "" | undefined) => (v === undefined || v === "" ? "" : String(v));
const toNum = (raw: string): number | "" => (raw.trim() === "" ? "" : Number(raw));

export function UnitTypesManager({ project }: { project: Project }) {
  const t = useTranslations("admin");
  const tp = useTranslations("projects");
  const tl = useTranslations("common.language");
  const m = useProjectMutations();
  const confirm = useConfirm();

  const [editing, setEditing] = useState<{ unit: UnitType | null; form: FormState } | null>(null);
  const [lang, setLang] = useState<PropertyLanguage>("ka");
  const [error, setError] = useState<string | null>(null);
  const [plansFor, setPlansFor] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [key]: value } } : e));

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    if (f.rooms === "" || f.areaFrom === "") {
      setError(t("common.required"));
      return;
    }
    setError(null);
    try {
      if (editing.unit) {
        await m.updateUnitType.mutateAsync({ projectId: project.id, unitTypeId: editing.unit.id, data: f });
      } else {
        const payload = Object.fromEntries(Object.entries(f).filter(([, v]) => !(typeof v === "string" && v.trim() === ""))) as UnitTypeInput;
        await m.createUnitType.mutateAsync({ projectId: project.id, data: payload });
      }
      setEditing(null);
      toast.success(t("common.saved"));
    } catch (e) {
      setError(getErrorMessage(e, t("common.saveError")));
    }
  };

  const numberField = (key: keyof FormState, label: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <FieldInput label={label} type="number" inputMode="decimal" value={num(editing?.form[key] as number | "")} onChange={(e) => set(key, toNum(e.target.value) as never)} {...extra} />
  );

  const availabilityOptions = Object.values(UnitAvailability).map((a) => ({ value: a, label: tp(`availability.${a}`) }));
  const plansUnit = project.unitTypes.find((u) => u.id === plansFor) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{t("projects.unitTypes.title")}</h2>
          <p className="text-xs text-gray-500">{t("projects.unitTypes.hint")}</p>
        </div>
        <Button onClick={() => { setEditing({ unit: null, form: EMPTY }); setLang("ka"); setError(null); }} className="bg-teal-900 hover:bg-teal-800">
          <Plus className="w-4 h-4 mr-2" />{t("projects.unitTypes.add")}
        </Button>
      </div>

      {error && !editing && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {project.unitTypes.length === 0 ? (
        <p className="border border-dashed border-gray-200 rounded-xl py-10 text-center text-sm text-gray-500">{t("projects.unitTypes.empty")}</p>
      ) : (
        <div className="space-y-3">
          {project.unitTypes.map((u) => (
            <div key={u.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-slate-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-xs text-gray-400">
                  {u.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${process.env.NEXT_PUBLIC_API_IMAGE_URL ?? "http://localhost:3000"}/${u.images[0].imageUrl}`} alt="" className="w-full h-full object-contain" />
                  ) : t("projects.unitTypes.noPlans")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-teal-950">{u.title || roomsLabel(tp, u.rooms)} <span className="text-gray-400 font-normal">· {roomsLabel(tp, u.rooms)}</span></p>
                  <p className="text-sm text-gray-600">
                    {formatAreaRange(u.areaFrom, u.areaTo)} m² · {u.pricePerSqm ? `${formatUsd(u.pricePerSqm)}/m²` : "—"} · {u.priceFrom ? formatUsd(u.priceFrom) : "—"} · {tp(`availability.${u.availability}`)}
                    {u.availableCount != null ? ` (${u.availableCount})` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t("projects.unitTypes.plans")}: {u.images.length}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPlansFor(plansFor === u.id ? null : u.id)}>{t("projects.unitTypes.plans")}</Button>
                  <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => { setEditing({ unit: u, form: toForm(u) }); setLang("ka"); setError(null); }}><Pencil className="w-4 h-4" /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                    aria-label={t("common.delete")}
                    onClick={async () => (await confirm({ description: t("projects.unitTypes.deleteConfirm"), destructive: true })) && m.deleteUnitType.mutateAsync({ projectId: project.id, unitTypeId: u.id }).catch((e) => setError(getErrorMessage(e, t("common.deleteError"))))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {plansFor === u.id && plansUnit && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <AdminImageGallery
                    compact
                    images={plansUnit.images}
                    onUpload={(files) => m.addUnitTypeImages.mutateAsync({ projectId: project.id, unitTypeId: u.id, files })}
                    onReorder={(imageIds) => m.reorderUnitTypeImages.mutateAsync({ projectId: project.id, unitTypeId: u.id, imageIds })}
                    onDelete={(imageId) => m.deleteImage.mutateAsync({ id: project.id, imageId })}
                    emptyLabel={t("projects.unitTypes.noPlans")}
                    deleteConfirm={t("projects.images.deleteConfirm")}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.unit ? t("projects.unitTypes.editTitle") : t("projects.unitTypes.newTitle")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {numberField("rooms", t("projects.unitTypes.rooms"), { min: 0, max: 20 })}
                {numberField("bedrooms", t("projects.unitTypes.bedrooms"), { min: 0 })}
                <FieldSelect label={t("projects.unitTypes.availability")} value={editing.form.availability} onValueChange={(v) => set("availability", v as UnitAvailability)} options={availabilityOptions} />
                {numberField("areaFrom", t("projects.unitTypes.areaFrom"), { min: 1, step: "0.1" })}
                {numberField("areaTo", t("projects.unitTypes.areaTo"), { min: 1, step: "0.1" })}
                {numberField("availableCount", t("projects.unitTypes.availableCount"), { min: 0 })}
                {numberField("pricePerSqm", t("projects.unitTypes.pricePerSqm"), { min: 0 })}
                {numberField("priceFrom", t("projects.unitTypes.priceFrom"), { min: 0 })}
                {numberField("sortOrder", t("projects.fields.sortOrder"))}
                {numberField("floorsFrom", t("projects.unitTypes.floorsFrom"))}
                {numberField("floorsTo", t("projects.unitTypes.floorsTo"))}
              </div>

              <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
                {PROPERTY_LANGUAGES.map((code) => (
                  <button key={code} type="button" onClick={() => setLang(code)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${lang === code ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{tl(code)}</button>
                ))}
              </div>
              <FieldInput label={t("common.titleIn", { language: tl(lang) })} value={String(editing.form[TITLE_KEY[lang]] ?? "")} onChange={(e) => set(TITLE_KEY[lang], e.target.value as never)} maxLength={120} />
              <FieldTextarea label={t("common.descriptionIn", { language: tl(lang) })} value={String(editing.form[DESC_KEY[lang]] ?? "")} onChange={(e) => set(DESC_KEY[lang], e.target.value as never)} rows={3} maxLength={3000} />

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
                <Button onClick={save} disabled={m.createUnitType.isPending || m.updateUnitType.isPending} className="bg-teal-900 hover:bg-teal-800">
                  <Save className="w-4 h-4 mr-2" />{t("common.save")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
