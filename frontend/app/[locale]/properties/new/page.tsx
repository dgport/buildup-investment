"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Building2, ChevronRight, Save, Check } from "lucide-react";
import { useCreateProperty } from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";
import {
  PropertyType,
  DealType,
  type CreatePropertyDto,
} from "@/lib/types/properties";
import {
  AmenitiesSection,
  BasicsSection,
  DetailsSection,
  LocationSection,
  TextsSection,
  type PropertyFormData,
} from "../_components/form/PropertyFormSections";
import { SectionTitle } from "../_components/form/FormPrimitives";
import {
  ImageDropzone,
  type PendingImage,
} from "../_components/form/ImageDropzone";

const INITIAL_FORM: PropertyFormData = {
  propertyType: PropertyType.APARTMENT,
  dealType: DealType.SALE,
  hotSale: false,
  public: true,
  isNonStandard: false,
};

const STEP_KEYS = ["basics", "location", "details", "amenities", "photos"] as const;

const hasAnyTitle = (data: PropertyFormData) =>
  [data.titleKa, data.titleEn, data.titleRu].some(
    (v) => typeof v === "string" && v.trim().length > 0,
  );

export default function CreatePropertyPage() {
  const router = useRouter();
  const t = useTranslations("dashboard.form");
  const createProperty = useCreateProperty();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = <K extends keyof CreatePropertyDto>(
    field: K,
    value: CreatePropertyDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !(field.startsWith("title") && prev.title)) return prev;
      const next = { ...prev };
      delete next[field];
      if (field.startsWith("title")) delete next.title;
      return next;
    });
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!formData.propertyType) newErrors.propertyType = t("errors.required");
      if (!formData.dealType) newErrors.dealType = t("errors.required");
      if (!hasAnyTitle(formData)) newErrors.title = t("errors.titleRequired");
      if (formData.price !== undefined && formData.price !== "" && formData.price < 0)
        newErrors.price = t("errors.invalidNumber");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEP_KEYS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push(ROUTES.DASHBOARD);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    setSubmitError(null);

    // Drop empty strings so nothing is sent as "clear"
    const cleaned = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "string") return v.trim() !== "";
        return true;
      }),
    ) as unknown as CreatePropertyDto;

    try {
      await createProperty.mutateAsync({
        data: cleaned,
        images: images.length ? images.map((i) => i.file) : undefined,
      });
      router.push(`${ROUTES.DASHBOARD}?created=1`);
    } catch (err) {
      setSubmitError(getErrorMessage(err, t("createFailed")));
    }
  };

  const isLastStep = step === STEP_KEYS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? t("previousStep") : t("backToDashboard")}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-900 rounded-xl p-2.5">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("newTitle")}
              </h1>
              <p className="text-sm text-gray-500">
                {t("stepOf", { step, total: STEP_KEYS.length })} —{" "}
                {t(`steps.${STEP_KEYS[step - 1]}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STEP_KEYS.map((key, i) => {
              const id = i + 1;
              return (
                <div key={key} className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => id < step && setStep(id)}
                    className="flex flex-col items-center gap-1 flex-1 text-left"
                  >
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        id <= step ? "bg-teal-800" : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium hidden sm:flex items-center gap-1 ${
                        id === step ? "text-teal-800" : "text-gray-400"
                      }`}
                    >
                      {id < step && <Check className="w-3 h-3" />}
                      {t(`steps.${key}`)}
                    </span>
                  </button>
                  {i < STEP_KEYS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300 shrink-0 mb-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-8">
              <BasicsSection
                data={formData}
                onChange={updateField}
                errors={errors}
              />
              <TextsSection
                data={formData}
                onChange={updateField}
                errors={errors}
              />
            </div>
          )}

          {step === 2 && (
            <LocationSection data={formData} onChange={updateField} />
          )}

          {step === 3 && (
            <DetailsSection
              data={formData}
              onChange={updateField}
              errors={errors}
            />
          )}

          {step === 4 && (
            <AmenitiesSection data={formData} onChange={updateField} />
          )}

          {step === 5 && (
            <div className="space-y-6">
              <SectionTitle>{t("sections.photos")}</SectionTitle>
              <ImageDropzone
                images={images}
                onChange={setImages}
                onError={setSubmitError}
              />
            </div>
          )}

          {(submitError || errors.title) && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{submitError ?? errors.title}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="px-6"
              >
                {t("previousStep")}
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={createProperty.isPending}
                className="flex-1 bg-teal-900 hover:bg-teal-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {createProperty.isPending ? t("creating") : t("create")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                className="flex-1 bg-teal-900 hover:bg-teal-800"
              >
                {t("steps." + STEP_KEYS[step])}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
