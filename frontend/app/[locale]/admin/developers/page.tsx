"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink, ImageIcon, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldInput, FieldTextarea } from "@/app/[locale]/properties/_components/form/FormPrimitives";
import { useAdminDevelopers, useDeveloperMutations } from "@/lib/hooks/useProjects";
import { PROPERTY_LANGUAGES, type PropertyLanguage } from "@/lib/types/properties";
import type { Developer, DeveloperInput } from "@/lib/types/projects";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";

type FormState = Required<Pick<DeveloperInput, "name" | "published">> & Omit<DeveloperInput, "name" | "published">;

const EMPTY: FormState = {
  name: "",
  published: true,
  slug: "",
  website: "",
  phone: "",
  email: "",
  foundedYear: "",
  descriptionKa: "",
  descriptionEn: "",
  descriptionRu: "",
};

const toForm = (d: Developer): FormState => {
  const tr = (l: string) => d.translations?.find((x) => x.language === l)?.description ?? "";
  return {
    name: d.name,
    published: d.published,
    slug: d.slug,
    website: d.website ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    foundedYear: d.foundedYear ?? "",
    descriptionKa: tr("ka"),
    descriptionEn: tr("en"),
    descriptionRu: tr("ru"),
  };
};

const DESC_KEY: Record<PropertyLanguage, keyof FormState> = { ka: "descriptionKa", en: "descriptionEn", ru: "descriptionRu" };

export default function AdminDevelopersPage() {
  const t = useTranslations("admin");
  const tl = useTranslations("common.language");
  const { data: developers = [], isLoading } = useAdminDevelopers();
  const m = useDeveloperMutations();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<{ dev: Developer | null; form: FormState } | null>(null);
  const [lang, setLang] = useState<PropertyLanguage>("ka");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [key]: value } } : e));

  const save = async () => {
    if (!editing) return;
    if (!editing.form.name.trim()) {
      setError(t("common.required"));
      return;
    }
    setError(null);
    try {
      if (editing.dev) {
        await m.update.mutateAsync({ id: editing.dev.id, data: editing.form });
      } else {
        const payload = Object.fromEntries(Object.entries(editing.form).filter(([, v]) => !(typeof v === "string" && v.trim() === ""))) as DeveloperInput;
        await m.create.mutateAsync(payload);
      }
      setEditing(null);
    } catch (e) {
      setError(getErrorMessage(e, t("common.saveError")));
    }
  };

  const remove = async (dev: Developer) => {
    if (!window.confirm(t("developers.deleteConfirm"))) return;
    setListError(null);
    try {
      await m.remove.mutateAsync(dev.id);
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setListError(status === 409 ? t("developers.hasProjects") : getErrorMessage(e, t("common.deleteError")));
    }
  };

  const uploadLogo = async (dev: Developer, file: File) => {
    setListError(null);
    try {
      await m.setLogo.mutateAsync({ id: dev.id, file });
    } catch (e) {
      setListError(getErrorMessage(e, t("common.saveError")));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-teal-950">{t("developers.title")}</h1>
        <Button onClick={() => { setEditing({ dev: null, form: EMPTY }); setLang("ka"); setError(null); }} className="bg-teal-900 hover:bg-teal-800">
          <Plus className="w-4 h-4 mr-2" />{t("developers.new")}
        </Button>
      </div>

      {listError && <Alert variant="destructive"><AlertDescription>{listError}</AlertDescription></Alert>}

      {isLoading ? (
        <p className="text-sm text-gray-500">{t("common.loading")}</p>
      ) : developers.length === 0 ? (
        <p className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500">{t("developers.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {developers.map((dev) => {
            const logo = resolveImageUrl(dev.logo);
            return (
              <div key={dev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <label className="w-20 h-20 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group relative" title={t("developers.fields.uploadLogo")}>
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={dev.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                  <span className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"><Upload className="w-5 h-5" /></span>
                  <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(dev, f); e.target.value = ""; }} />
                </label>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-teal-950 truncate">{dev.name}</p>
                    {!dev.published && <span className="text-[10px] font-medium bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{t("common.unpublished")}</span>}
                  </div>
                  <p className="text-xs text-gray-500">/{dev.slug} · {t("developers.projectsCount", { count: dev.projectsCount })}</p>
                  <p className="text-xs text-gray-500 truncate">{[dev.phone, dev.email, dev.website].filter(Boolean).join(" · ")}</p>
                  <div className="flex gap-1 mt-2">
                    {dev.published && (
                      <Button variant="ghost" size="icon-sm" asChild aria-label={t("common.view")}>
                        <Link href={ROUTES.DEVELOPER(dev.slug)} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" aria-label={t("common.edit")} onClick={() => { setEditing({ dev, form: toForm(dev) }); setLang("ka"); setError(null); }}><Pencil className="w-4 h-4" /></Button>
                    {dev.logo && (
                      <Button variant="ghost" size="icon-sm" aria-label={t("developers.fields.removeLogo")} onClick={() => m.removeLogo.mutateAsync(dev.id)}><ImageIcon className="w-4 h-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50" aria-label={t("common.delete")} onClick={() => remove(dev)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.dev ? t("developers.editTitle") : t("developers.new")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldInput label={t("developers.fields.name")} required value={editing.form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
                <FieldInput label={t("developers.fields.slug")} value={editing.form.slug ?? ""} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="orbi-group" />
                <FieldInput label={t("developers.fields.phone")} type="tel" value={editing.form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                <FieldInput label={t("developers.fields.email")} type="email" value={editing.form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                <FieldInput label={t("developers.fields.website")} type="url" value={editing.form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                <FieldInput label={t("developers.fields.foundedYear")} type="number" min={1900} max={2100} value={editing.form.foundedYear === "" || editing.form.foundedYear === undefined ? "" : String(editing.form.foundedYear)} onChange={(e) => set("foundedYear", e.target.value.trim() === "" ? "" : Number(e.target.value))} />
              </div>
              <label className="flex items-center gap-3 w-fit cursor-pointer">
                <Checkbox checked={editing.form.published} onCheckedChange={(c) => set("published", c === true)} />
                <span className="text-sm font-medium text-gray-700">{t("developers.fields.published")}</span>
              </label>

              <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
                {PROPERTY_LANGUAGES.map((code) => (
                  <button key={code} type="button" onClick={() => setLang(code)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${lang === code ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{tl(code)}</button>
                ))}
              </div>
              <FieldTextarea label={`${t("developers.fields.description")} (${tl(lang)})`} value={String(editing.form[DESC_KEY[lang]] ?? "")} onChange={(e) => set(DESC_KEY[lang], e.target.value as never)} rows={4} maxLength={5000} />

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
                <Button onClick={save} disabled={m.create.isPending || m.update.isPending} className="bg-teal-900 hover:bg-teal-800">
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
