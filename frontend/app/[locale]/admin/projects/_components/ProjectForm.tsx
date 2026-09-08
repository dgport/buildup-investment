"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Flame, Eye, EyeOff, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FieldInput,
  FieldSelect,
  FieldTextarea,
  SectionTitle,
  ToggleChip,
} from "@/app/[locale]/properties/_components/form/FormPrimitives";
import { parseLocation } from "@/app/[locale]/properties/_components/form/PropertyFormSections";
import { PropertyLocationPicker } from "@/app/[locale]/properties/_components/PropertyLocationPicker";
import { Region, PROPERTY_LANGUAGES, type PropertyLanguage } from "@/lib/types/properties";
import { PROJECT_AMENITIES, ProjectStatus, type Developer, type Project, type ProjectInput } from "@/lib/types/projects";

export type ProjectFormState = Required<
  Pick<ProjectInput, "developerId" | "status" | "hotSale" | "published" | "installmentAvailable" | "amenities">
> &
  Omit<ProjectInput, "developerId" | "status" | "hotSale" | "published" | "installmentAvailable" | "amenities">;

export const EMPTY_PROJECT_FORM: ProjectFormState = {
  developerId: "",
  status: ProjectStatus.UNDER_CONSTRUCTION,
  hotSale: false,
  published: true,
  installmentAvailable: false,
  amenities: [],
  slug: "",
  titleKa: "",
  titleEn: "",
  titleRu: "",
  descriptionKa: "",
  descriptionEn: "",
  descriptionRu: "",
  region: "",
  address: "",
  location: "",
  progress: "",
  deliveryQuarter: "",
  deliveryYear: "",
  floors: "",
  totalApartments: "",
  pricePerSqmFrom: "",
  priceFrom: "",
  videoUrl: "",
  tourUrl: "",
  downPaymentPercent: "",
  installmentMonths: "",
  sortOrder: "",
};

export function projectToForm(p: Project): ProjectFormState {
  const tr = (lang: string) => p.translations?.find((x) => x.language === lang);
  return {
    developerId: p.developer.id,
    status: p.status,
    hotSale: p.hotSale,
    published: p.published,
    installmentAvailable: p.installmentAvailable,
    amenities: p.amenities,
    slug: p.slug,
    titleKa: tr("ka")?.title ?? "",
    titleEn: tr("en")?.title ?? "",
    titleRu: tr("ru")?.title ?? "",
    descriptionKa: tr("ka")?.description ?? "",
    descriptionEn: tr("en")?.description ?? "",
    descriptionRu: tr("ru")?.description ?? "",
    region: p.region ?? "",
    address: p.address ?? "",
    location: p.location ?? "",
    progress: p.progress ?? "",
    deliveryQuarter: p.deliveryQuarter ?? "",
    deliveryYear: p.deliveryYear ?? "",
    floors: p.floors ?? "",
    totalApartments: p.totalApartments ?? "",
    pricePerSqmFrom: p.pricePerSqmFrom ?? "",
    priceFrom: p.priceFrom ?? "",
    videoUrl: p.videoUrl ?? "",
    tourUrl: p.tourUrl ?? "",
    downPaymentPercent: p.downPaymentPercent ?? "",
    installmentMonths: p.installmentMonths ?? "",
    sortOrder: p.sortOrder ?? "",
  };
}

/** Only changed keys (for PATCH); "" is sent as "" which the API treats as clear. */
export function diffProjectForm(original: ProjectFormState, current: ProjectFormState): ProjectInput {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(current) as (keyof ProjectFormState)[]) {
    const a = original[key];
    const b = current[key];
    const same = Array.isArray(a) && Array.isArray(b) ? a.join() === b.join() : a === b;
    if (!same) out[key] = b;
  }
  return out as ProjectInput;
}

const TITLE_KEY: Record<PropertyLanguage, keyof ProjectFormState> = { ka: "titleKa", en: "titleEn", ru: "titleRu" };
const DESC_KEY: Record<PropertyLanguage, keyof ProjectFormState> = { ka: "descriptionKa", en: "descriptionEn", ru: "descriptionRu" };

const numberValue = (v: number | "" | undefined) => (v === undefined || v === "" ? "" : String(v));
const toNumber = (raw: string): number | "" => (raw.trim() === "" ? "" : Number(raw));

interface Props {
  data: ProjectFormState;
  onChange: <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => void;
  developers: Developer[];
  errors?: Record<string, string>;
}

export function ProjectForm({ data, onChange, developers, errors = {} }: Props) {
  const t = useTranslations("admin");
  const tp = useTranslations("projects");
  const tprop = useTranslations("properties");
  const tl = useTranslations("common.language");
  const [lang, setLang] = useState<PropertyLanguage>("ka");
  const [showMap, setShowMap] = useState(false);
  const coords = parseLocation(data.location);

  const developerOptions = useMemo(() => developers.map((d) => ({ value: d.id, label: d.name })), [developers]);
  const regionOptions = useMemo(() => Object.values(Region).map((r) => ({ value: r, label: tprop(`enums.region.${r}`) })), [tprop]);
  const statusOptions = Object.values(ProjectStatus).map((s) => ({ value: s, label: tp(`status.${s}`) }));

  const numberField = (key: keyof ProjectFormState, label: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <FieldInput
      label={label}
      type="number"
      inputMode="numeric"
      value={numberValue(data[key] as number | "")}
      onChange={(e) => onChange(key, toNumber(e.target.value) as never)}
      error={errors[key]}
      {...extra}
    />
  );

  return (
    <div className="space-y-10">
      {/* Basics */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.basics")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSelect
            label={t("projects.fields.developer")}
            required
            value={data.developerId}
            onValueChange={(v) => onChange("developerId", v)}
            options={developerOptions}
            placeholder={t("common.select")}
            error={errors.developerId}
          />
          <FieldSelect
            label={t("projects.fields.status")}
            value={data.status}
            onValueChange={(v) => onChange("status", v as ProjectStatus)}
            options={statusOptions}
          />
          <div className="sm:col-span-2">
            <FieldInput
              label={t("projects.fields.slug")}
              value={data.slug ?? ""}
              onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="orbi-city"
              error={errors.slug}
            />
            <p className="text-xs text-gray-400 mt-1">{t("projects.fields.slugHint")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ToggleChip icon={<Flame className="w-4 h-4" />} label={t("projects.fields.hotSale")} active={data.hotSale} activeClass="bg-red-50 border-red-300 text-red-600" onChange={(v) => onChange("hotSale", v)} />
          <ToggleChip icon={data.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} label={data.published ? t("common.published") : t("common.unpublished")} active={data.published} activeClass="bg-green-50 border-green-300 text-green-600" onChange={(v) => onChange("published", v)} />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.texts")}</SectionTitle>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {PROPERTY_LANGUAGES.map((code) => {
            const filled = String(data[TITLE_KEY[code]] ?? "").trim().length > 0;
            return (
              <button key={code} type="button" onClick={() => setLang(code)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${lang === code ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800"}`}>
                {tl(code)}
                <span className={`w-1.5 h-1.5 rounded-full ${filled ? "bg-green-500" : "bg-gray-300"}`} />
              </button>
            );
          })}
        </div>
        <FieldInput
          label={t("common.titleIn", { language: tl(lang) })}
          required={lang === "ka"}
          value={String(data[TITLE_KEY[lang]] ?? "")}
          onChange={(e) => onChange(TITLE_KEY[lang], e.target.value as never)}
          maxLength={200}
          error={errors.title}
        />
        <FieldTextarea
          label={t("common.descriptionIn", { language: tl(lang) })}
          value={String(data[DESC_KEY[lang]] ?? "")}
          onChange={(e) => onChange(DESC_KEY[lang], e.target.value as never)}
          rows={6}
          maxLength={10000}
        />
        {errors.title && (
          <Alert variant="destructive"><AlertDescription>{errors.title}</AlertDescription></Alert>
        )}
      </div>

      {/* Location */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.location")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSelect label={t("projects.fields.region")} value={data.region ?? ""} onValueChange={(v) => onChange("region", v as Region | "")} options={regionOptions} placeholder={t("common.select")} clearLabel={t("common.notSpecified")} />
          <FieldInput label={t("projects.fields.address")} value={data.address ?? ""} onChange={(e) => onChange("address", e.target.value)} maxLength={300} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{t("projects.fields.location")}</Label>
          <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <p className={`text-sm truncate ${coords ? "font-mono text-blue-700" : "text-gray-500"}`}>
              {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : t("common.notSpecified")}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {coords && (
                <button type="button" onClick={() => onChange("location", "")} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"><X className="w-3 h-3" />{t("common.delete")}</button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => setShowMap(true)}><MapPin className="w-4 h-4 mr-1.5" />{t("projects.fields.location")}</Button>
            </div>
          </div>
        </div>
        {showMap && (
          <PropertyLocationPicker
            initialLocation={coords ? { lat: coords.lat, lng: coords.lng } : null}
            onClose={() => setShowMap(false)}
            onLocationSelect={({ coordinates, address }) => {
              onChange("location", `${coordinates[1]},${coordinates[0]}`);
              if (!data.address?.trim() && address) onChange("address", address);
              setShowMap(false);
            }}
          />
        )}
      </div>

      {/* Facts */}
      <div className="space-y-5">
        <SectionTitle hint={t("projects.fields.priceHint")}>{t("projects.sections.facts")}</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {numberField("progress", t("projects.fields.progress"), { min: 0, max: 100 })}
          <FieldSelect
            label={t("projects.fields.deliveryQuarter")}
            value={data.deliveryQuarter === "" || data.deliveryQuarter === undefined ? "" : String(data.deliveryQuarter)}
            onValueChange={(v) => onChange("deliveryQuarter", v === "" ? "" : Number(v))}
            options={[1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}` }))}
            placeholder={t("common.select")}
            clearLabel={t("common.notSpecified")}
          />
          {numberField("deliveryYear", t("projects.fields.deliveryYear"), { min: 2000, max: 2100, placeholder: "2027" })}
          {numberField("floors", t("projects.fields.floors"), { min: 1 })}
          {numberField("totalApartments", t("projects.fields.totalApartments"), { min: 1 })}
          {numberField("pricePerSqmFrom", t("projects.fields.pricePerSqmFrom"), { min: 0, placeholder: "1250" })}
          {numberField("priceFrom", t("projects.fields.priceFrom"), { min: 0, placeholder: "45000" })}
          {numberField("sortOrder", t("projects.fields.sortOrder"))}
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.payment")}</SectionTitle>
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 cursor-pointer w-fit">
          <Checkbox checked={data.installmentAvailable} onCheckedChange={(c) => onChange("installmentAvailable", c === true)} />
          <span className="text-sm font-medium text-gray-700">{t("projects.fields.installmentAvailable")}</span>
        </label>
        {data.installmentAvailable && (
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {numberField("downPaymentPercent", t("projects.fields.downPaymentPercent"), { min: 0, max: 100, placeholder: "30" })}
            {numberField("installmentMonths", t("projects.fields.installmentMonths"), { min: 1, placeholder: "24" })}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.amenities")}</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {PROJECT_AMENITIES.map((key) => {
            const checked = data.amenities.includes(key);
            return (
              <label key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer text-sm transition ${checked ? "bg-blue-50 border-blue-300 text-blue-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) =>
                    onChange("amenities", c === true ? [...data.amenities, key] : data.amenities.filter((a) => a !== key))
                  }
                />
                {tp(`amenities.${key}`)}
              </label>
            );
          })}
        </div>
      </div>

      {/* Media */}
      <div className="space-y-5">
        <SectionTitle>{t("projects.sections.media")}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput label={t("projects.fields.videoUrl")} type="url" value={data.videoUrl ?? ""} onChange={(e) => onChange("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" error={errors.videoUrl} />
          <FieldInput label={t("projects.fields.tourUrl")} type="url" value={data.tourUrl ?? ""} onChange={(e) => onChange("tourUrl", e.target.value)} placeholder="https://…" error={errors.tourUrl} />
        </div>
      </div>
    </div>
  );
}
