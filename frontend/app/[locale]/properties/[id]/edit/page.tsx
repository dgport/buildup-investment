"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Home,
  ImageIcon,
  Languages,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  usePropertyManage,
  useUpdateProperty,
} from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";
import {
  type CreatePropertyDto,
  type Property,
  type UpdatePropertyDto,
  AMENITY_KEYS,
} from "@/lib/types/properties";
import {
  AmenitiesSection,
  BasicsSection,
  DetailsSection,
  LocationSection,
  TextsSection,
  type PropertyFormData,
} from "../../_components/form/PropertyFormSections";
import { PropertyImagesManager } from "../../_components/PropertyImagesManager";
import { PropertyTranslationsManager } from "../../_components/PropertyTranslationsManager";

type Tab = "details" | "images" | "translations";

const TABS: { id: Tab; icon: React.ElementType }[] = [
  { id: "details", icon: Home },
  { id: "images", icon: ImageIcon },
  { id: "translations", icon: Languages },
];

/** Map the API object to the form shape (nulls → "" so fields are controlled). */
function propertyToFormData(p: Property): PropertyFormData {
  const translation = (lang: string) =>
    p.translations?.find((t) => t.language === lang);

  const amenities = Object.fromEntries(
    AMENITY_KEYS.map((key) => [key, p[key] === true]),
  ) as Partial<CreatePropertyDto>;

  return {
    propertyType: p.propertyType,
    dealType: p.dealType,
    titleKa: translation("ka")?.title ?? "",
    titleEn: translation("en")?.title ?? "",
    titleRu: translation("ru")?.title ?? "",
    descriptionKa: translation("ka")?.description ?? "",
    descriptionEn: translation("en")?.description ?? "",
    descriptionRu: translation("ru")?.description ?? "",
    region: p.region ?? "",
    address: p.address ?? "",
    location: p.location ?? "",
    contactPhone: p.contactPhone === p.user?.phone ? "" : (p.contactPhone ?? ""),
    hotSale: p.hotSale,
    public: p.public,
    price: p.price ?? "",
    totalArea: p.totalArea ?? "",
    rooms: p.rooms ?? "",
    bedrooms: p.bedrooms ?? "",
    bathrooms: p.bathrooms ?? "",
    floors: p.floors ?? "",
    floorsTotal: p.floorsTotal ?? "",
    ceilingHeight: p.ceilingHeight ?? "",
    balconyArea: p.balconyArea ?? "",
    isNonStandard: p.isNonStandard,
    occupancy: p.occupancy ?? "",
    heating: p.heating ?? "",
    hotWater: p.hotWater ?? "",
    parking: p.parking ?? "",
    ...amenities,
  };
}

/** Only the fields that differ from the loaded property are sent. */
function diffFormData(
  original: PropertyFormData,
  current: PropertyFormData,
): UpdatePropertyDto {
  const changed: Record<string, unknown> = {};
  for (const key of Object.keys(current) as (keyof PropertyFormData)[]) {
    if (original[key] !== current[key]) changed[key] = current[key];
  }
  return changed as UpdatePropertyDto;
}

const hasAnyTitle = (data: PropertyFormData) =>
  [data.titleKa, data.titleEn, data.titleRu].some(
    (v) => typeof v === "string" && v.trim().length > 0,
  );

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard.form");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common.actions");

  const { data: property, isLoading, error } = usePropertyManage(id, locale);
  const updateProperty = useUpdateProperty();

  const [tab, setTab] = useState<Tab>("details");
  const [original, setOriginal] = useState<PropertyFormData | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (property) {
      const mapped = propertyToFormData(property);
      setOriginal(mapped);
      setFormData(mapped);
    }
  }, [property]);

  const changes = useMemo(
    () => (original ? diffFormData(original, formData) : {}),
    [original, formData],
  );
  const hasChanges = Object.keys(changes).length > 0;

  const updateField = <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedAt(null);
    if (field.startsWith("title")) setErrors({});
  };

  const handleSubmit = async () => {
    if (!hasAnyTitle(formData)) {
      setErrors({ title: t("errors.titleRequired") });
      return;
    }
    setSubmitError(null);
    try {
      await updateProperty.mutateAsync({ id, data: changes });
      setSavedAt(Date.now());
    } catch (err) {
      setSubmitError(getErrorMessage(err, t("updateFailed")));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-800" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-600">{t("notFound")}</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.DASHBOARD)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToDashboard")}
        </Button>
      </div>
    );
  }

  const heading =
    property.translation?.title || property.address || `#${property.externalId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {t("editTitle")}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {heading} · ID {property.externalId}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {property.public && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.PROPERTY(property.id)} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    {td("view")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
          {TABS.map(({ id: tabId, icon: Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => {
                setTab(tabId);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                tab === tabId
                  ? "border-teal-800 text-teal-800"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(`tabs.${tabId}`)}
              {tabId === "details" && hasChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {tab === "details" && (
            <div className="space-y-10">
              <BasicsSection data={formData} onChange={updateField} errors={errors} />
              <TextsSection data={formData} onChange={updateField} errors={errors} />
              <LocationSection data={formData} onChange={updateField} />
              <DetailsSection data={formData} onChange={updateField} />
              <AmenitiesSection data={formData} onChange={updateField} />

              {(submitError || errors.title) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {submitError ?? errors.title}
                  </AlertDescription>
                </Alert>
              )}

              {savedAt && !hasChanges && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {t("saved")}
                  </AlertDescription>
                </Alert>
              )}

              <div className="sticky bottom-4 z-10 flex gap-3 pt-4 border-t border-gray-100 bg-white/95 backdrop-blur rounded-b-2xl">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={updateProperty.isPending || !hasChanges}
                  className="flex-1 bg-teal-900 hover:bg-teal-800"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProperty.isPending ? t("saving") : t("saveChanges")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => original && setFormData(original)}
                  disabled={!hasChanges}
                  className="px-6"
                >
                  {tc("cancel")}
                </Button>
              </div>
            </div>
          )}

          {tab === "images" && <PropertyImagesManager propertyId={id} />}

          {tab === "translations" && (
            <PropertyTranslationsManager propertyId={id} />
          )}
        </div>
      </div>
    </div>
  );
}
