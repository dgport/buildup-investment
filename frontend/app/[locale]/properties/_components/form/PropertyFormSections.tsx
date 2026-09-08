"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Flame, Eye, EyeOff, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  PropertyType,
  DealType,
  HeatingType,
  HotWaterType,
  ParkingType,
  Occupancy,
  Region,
  type CreatePropertyDto,
  type AmenityKey,
  type PropertyLanguage,
} from "@/lib/types/properties";
import {
  FieldInput,
  FieldSelect,
  FieldTextarea,
  SectionTitle,
  ToggleChip,
} from "./FormPrimitives";
import { usePropertyOptions } from "./usePropertyOptions";
import { PropertyLocationPicker } from "../PropertyLocationPicker";

export type PropertyFormData = Partial<CreatePropertyDto>;

export interface SectionProps {
  data: PropertyFormData;
  onChange: <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K],
  ) => void;
  errors?: Record<string, string>;
}

/** Parse "lat,lng" into numbers (null when missing/invalid). */
export function parseLocation(location?: string | null) {
  if (!location) return null;
  const [lat, lng] = location.split(",").map((v) => Number(v.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

const numberValue = (v: number | "" | undefined) =>
  v === undefined || v === "" ? "" : String(v);

const toNumber = (raw: string): number | "" =>
  raw.trim() === "" ? "" : Number(raw);

// ─── Basics ──────────────────────────────────────────────────────────────────

export function BasicsSection({ data, onChange, errors = {} }: SectionProps) {
  const t = useTranslations("dashboard.form");
  const options = usePropertyOptions();

  return (
    <div className="space-y-6">
      <SectionTitle>{t("sections.basics")}</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldSelect
          label={t("propertyType")}
          required
          value={data.propertyType ?? ""}
          onValueChange={(v) => onChange("propertyType", v as PropertyType)}
          options={options.propertyTypes}
          placeholder={t("select")}
          error={errors.propertyType}
        />
        <FieldSelect
          label={t("dealType")}
          required
          value={data.dealType ?? ""}
          onValueChange={(v) => onChange("dealType", v as DealType)}
          options={options.dealTypes}
          placeholder={t("select")}
          error={errors.dealType}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldInput
          label={t("price")}
          type="number"
          min={0}
          inputMode="numeric"
          value={numberValue(data.price)}
          onChange={(e) => onChange("price", toNumber(e.target.value))}
          placeholder={t("pricePlaceholder")}
          error={errors.price}
        />
        <FieldInput
          label={t("contactPhone")}
          type="tel"
          value={data.contactPhone ?? ""}
          onChange={(e) => onChange("contactPhone", e.target.value)}
          placeholder={t("contactPhonePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          {t("sections.visibility")}
        </Label>
        <div className="flex flex-wrap gap-3">
          <ToggleChip
            icon={<Flame className="w-4 h-4" />}
            label={t("hotSale")}
            active={data.hotSale === true}
            activeClass="bg-red-50 border-red-300 text-red-600"
            onChange={(v) => onChange("hotSale", v)}
          />
          <ToggleChip
            icon={
              data.public !== false ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )
            }
            label={data.public !== false ? t("public") : t("privateLabel")}
            active={data.public !== false}
            activeClass="bg-green-50 border-green-300 text-green-600"
            onChange={(v) => onChange("public", v)}
          />
        </div>
        <p className="text-xs text-gray-400">{t("publicHint")}</p>
      </div>
    </div>
  );
}

// ─── Title & description per language ────────────────────────────────────────

const TITLE_FIELD: Record<PropertyLanguage, keyof CreatePropertyDto> = {
  ka: "titleKa",
  en: "titleEn",
  ru: "titleRu",
};
const DESCRIPTION_FIELD: Record<PropertyLanguage, keyof CreatePropertyDto> = {
  ka: "descriptionKa",
  en: "descriptionEn",
  ru: "descriptionRu",
};

export function TextsSection({ data, onChange, errors = {} }: SectionProps) {
  const t = useTranslations("dashboard.form");
  const locale = useLocale() as PropertyLanguage;
  const { languages } = usePropertyOptions();
  const [active, setActive] = useState<PropertyLanguage>(
    languages.some((l) => l.code === locale) ? locale : "ka",
  );

  const titleOf = (code: PropertyLanguage) =>
    (data[TITLE_FIELD[code]] as string | undefined) ?? "";

  return (
    <div className="space-y-5">
      <SectionTitle hint={t("textsHint")}>{t("sections.texts")}</SectionTitle>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {languages.map(({ code, label }) => {
          const filled = titleOf(code).trim().length > 0;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setActive(code)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                active === code
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
              <span
                className={`w-1.5 h-1.5 rounded-full ${filled ? "bg-green-500" : "bg-gray-300"}`}
              />
            </button>
          );
        })}
      </div>

      {languages.map(({ code, label }) =>
        code === active ? (
          <div key={code} className="space-y-4">
            <FieldInput
              label={t("titleIn", { language: label })}
              required={code === locale || code === "ka"}
              value={titleOf(code)}
              onChange={(e) => onChange(TITLE_FIELD[code], e.target.value)}
              placeholder={t("titlePlaceholder")}
              maxLength={200}
              error={errors.title}
            />
            <FieldTextarea
              label={t("descriptionIn", { language: label })}
              value={
                (data[DESCRIPTION_FIELD[code]] as string | undefined) ?? ""
              }
              onChange={(e) =>
                onChange(DESCRIPTION_FIELD[code], e.target.value)
              }
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              maxLength={5000}
            />
          </div>
        ) : null,
      )}
    </div>
  );
}

// ─── Location ────────────────────────────────────────────────────────────────

export function LocationSection({ data, onChange }: SectionProps) {
  const t = useTranslations("dashboard.form");
  const options = usePropertyOptions();
  const [showMap, setShowMap] = useState(false);
  const coords = parseLocation(data.location);

  return (
    <div className="space-y-6">
      <SectionTitle>{t("sections.location")}</SectionTitle>

      <FieldSelect
        label={t("region")}
        value={data.region ?? ""}
        onValueChange={(v) => onChange("region", v as Region | "")}
        options={options.regions}
        placeholder={t("selectRegion")}
        clearLabel={t("notSpecified")}
      />

      <FieldInput
        label={t("address")}
        value={data.address ?? ""}
        onChange={(e) => onChange("address", e.target.value)}
        placeholder={t("addressPlaceholder")}
        maxLength={300}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          {t("mapPin")}
        </Label>
        <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin
              className={`w-4 h-4 shrink-0 ${coords ? "text-teal-700" : "text-gray-400"}`}
            />
            <p
              className={`text-sm truncate ${coords ? "font-mono text-teal-800" : "text-gray-500"}`}
            >
              {coords
                ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                : t("noPin")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {coords && (
              <button
                type="button"
                onClick={() => onChange("location", "")}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {t("clearPin")}
              </button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(true)}
            >
              <MapPin className="w-4 h-4 mr-1.5" />
              {coords ? t("changeOnMap") : t("pickOnMap")}
            </Button>
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
  );
}

// ─── Details ─────────────────────────────────────────────────────────────────

export function DetailsSection({ data, onChange, errors = {} }: SectionProps) {
  const t = useTranslations("dashboard.form");
  const options = usePropertyOptions();
  const isLand = data.propertyType === PropertyType.LAND;

  const numberFields: {
    field:
      | "totalArea"
      | "rooms"
      | "bedrooms"
      | "bathrooms"
      | "floors"
      | "floorsTotal"
      | "ceilingHeight"
      | "balconyArea";
    label: string;
    placeholder: string;
    step?: string;
    hideForLand?: boolean;
  }[] = [
    { field: "totalArea", label: t("totalArea"), placeholder: "120" },
    { field: "rooms", label: t("rooms"), placeholder: "3", hideForLand: true },
    { field: "bedrooms", label: t("bedrooms"), placeholder: "2", hideForLand: true },
    { field: "bathrooms", label: t("bathrooms"), placeholder: "1", hideForLand: true },
    { field: "floors", label: t("floor"), placeholder: "5", hideForLand: true },
    { field: "floorsTotal", label: t("floorsTotal"), placeholder: "10", hideForLand: true },
    { field: "ceilingHeight", label: t("ceilingHeight"), placeholder: "3.0", step: "0.1", hideForLand: true },
    { field: "balconyArea", label: t("balconyArea"), placeholder: "10", step: "0.1", hideForLand: true },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle>{t("sections.details")}</SectionTitle>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {numberFields
          .filter((f) => !(isLand && f.hideForLand))
          .map(({ field, label, placeholder, step }) => (
            <FieldInput
              key={field}
              label={label}
              type="number"
              min={0}
              step={step}
              inputMode="decimal"
              value={numberValue(data[field])}
              onChange={(e) => onChange(field, toNumber(e.target.value))}
              placeholder={placeholder}
              error={errors[field]}
            />
          ))}
      </div>

      {!isLand && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldSelect
              label={t("heating")}
              value={data.heating ?? ""}
              onValueChange={(v) => onChange("heating", v as HeatingType | "")}
              options={options.heating}
              placeholder={t("select")}
              clearLabel={t("notSpecified")}
            />
            <FieldSelect
              label={t("hotWater")}
              value={data.hotWater ?? ""}
              onValueChange={(v) =>
                onChange("hotWater", v as HotWaterType | "")
              }
              options={options.hotWater}
              placeholder={t("select")}
              clearLabel={t("notSpecified")}
            />
            <FieldSelect
              label={t("parking")}
              value={data.parking ?? ""}
              onValueChange={(v) => onChange("parking", v as ParkingType | "")}
              options={options.parking}
              placeholder={t("select")}
              clearLabel={t("notSpecified")}
            />
          </div>

          <FieldSelect
            label={t("occupancy")}
            value={data.occupancy ?? ""}
            onValueChange={(v) => onChange("occupancy", v as Occupancy | "")}
            options={options.occupancy}
            placeholder={t("select")}
            clearLabel={t("notSpecified")}
          />

          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-700 cursor-pointer w-fit">
            <Checkbox
              checked={data.isNonStandard === true}
              onCheckedChange={(c) => onChange("isNonStandard", c === true)}
            />
            <span className="text-sm font-medium">{t("nonStandard")}</span>
          </label>
        </>
      )}
    </div>
  );
}

// ─── Amenities ───────────────────────────────────────────────────────────────

/** Amenities that make sense for land plots. */
const LAND_AMENITIES: AmenityKey[] = [
  "hasWater",
  "hasElectricity",
  "hasNaturalGas",
  "hasSewerage",
  "isFenced",
  "hasGate",
  "hasYardLighting",
  "hasInternet",
];

export function AmenitiesSection({ data, onChange }: SectionProps) {
  const t = useTranslations("dashboard.form");
  const { amenities } = usePropertyOptions();
  const isLand = data.propertyType === PropertyType.LAND;
  const visible = isLand
    ? amenities.filter((a) => LAND_AMENITIES.includes(a.key))
    : amenities;

  return (
    <div className="space-y-6">
      <SectionTitle>{t("sections.amenities")}</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visible.map(({ key, label }) => {
          const checked = data[key] === true;
          return (
            <label
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                checked
                  ? "bg-teal-50 border-teal-400 text-teal-950"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(c) => onChange(key, c === true)}
                className="shrink-0"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
