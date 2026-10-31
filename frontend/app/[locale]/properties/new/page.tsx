"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { invalidPropertyNumbers } from "@/lib/utils/property-validation";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { PageLoader } from "@/components/shared/PageLoader";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys, useCurrentUser } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronRight, Save } from "lucide-react";
import { useCreateProperty, useMyPropertyStats } from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";
import { PropertyType, DealType, type CreatePropertyDto } from "@/lib/types/properties";
import {
  AmenitiesSection,
  BasicsSection,
  DetailsSection,
  LocationSection,
  TextsSection,
  type PropertyFormData,
} from "../_components/form/PropertyFormSections";
import { SectionTitle } from "../_components/form/FormPrimitives";
import { ImageDropzone } from "../_components/form/ImageDropzone";
import { usePendingImages } from "@/lib/hooks/usePendingImages";
import { FormStepper, STEP_KEYS } from "../_components/form/FormStepper";
import { ListingTermsConsent } from "../_components/form/ListingTermsConsent";

const INITIAL_FORM: PropertyFormData = {
  propertyType: PropertyType.APARTMENT,
  dealType: DealType.SALE,
  hotSale: false,
  public: true,
  isNonStandard: false,
};

const hasAnyTitle = (data: PropertyFormData) =>
  [data.titleKa, data.titleEn, data.titleRu].some((v) => typeof v === "string" && v.trim().length > 0);

function CreatePropertyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations("dashboard.form");
  const { data: quota } = useMyPropertyStats();
  const createProperty = useCreateProperty();
  const submitting = useRef(false);
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const termsAlreadyAccepted = !!currentUser?.listingTermsAccepted;
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(() => ({ ...INITIAL_FORM,
    dealType: params.get("dealType") === DealType.RENT ? DealType.RENT : params.get("dealType") === DealType.DAILY_RENT ? DealType.DAILY_RENT : DealType.SALE,
  }));
  const [images, setImages] = usePendingImages();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const dirty = !completed && (edited || images.length > 0);
  useUnsavedChanges(dirty);

  const updateField = <K extends keyof CreatePropertyDto>(field: K, value: CreatePropertyDto[K]) => {
    setEdited(true);
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

    }
    for (const field of invalidPropertyNumbers(formData)) {
      if ((s === 1 && field === "price") || (s === 3 && field !== "price")) newErrors[field] = t("errors.invalidNumber");
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    return Object.keys(newErrors).length === 0;
  };

  const goTo = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (validateStep(step)) goTo(Math.min(step + 1, STEP_KEYS.length));
  };

  const goBack = async () => {
    if (step > 1) goTo(step - 1);
    else if (!dirty || await confirm({ description: t("unsavedConfirm") })) router.push(ROUTES.DASHBOARD);
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (quota && quota.total >= quota.listingLimit) {
      setSubmitError(t("limitReached"));
      return;
    }
    if (!validateStep(1)) {
      goTo(1);
      return;
    }
    if (!validateStep(3)) { goTo(3); return; }
    if (!termsAlreadyAccepted && !acceptTerms) {
      setTermsError(true);
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
    if (!termsAlreadyAccepted) cleaned.acceptTerms = true;

    submitting.current = true;
    try {
      await createProperty.mutateAsync({
        data: cleaned,
        images: images.length ? images.map((i) => i.file) : undefined,
      });
      // Acceptance is now stored on the account
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
      setCompleted(true);
      router.push(`${ROUTES.DASHBOARD}?created=1`);
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } }).response?.data?.code;
      if (code === "LISTING_TERMS_REQUIRED") {
        // Terms changed while the form was open – ask again
        setAcceptTerms(false);
        setTermsError(true);
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
        return;
      }
      setSubmitError(code === "LISTING_LIMIT_REACHED" ? t("limitReached") : getErrorMessage(err, t("createFailed")));
    } finally {
      submitting.current = false;
    }
  };

  const isLastStep = step === STEP_KEYS.length;

  if (quota && quota.total >= quota.listingLimit) {
    return <div className="min-h-[60vh] p-6 flex items-center justify-center">
      <div className="max-w-lg space-y-5 rounded-2xl border bg-white p-6 text-center">
        <p role="status" className="text-teal-950 leading-7">{t("limitReached")}</p>
        <Button onClick={() => router.push(ROUTES.DASHBOARD)}>{t("backToDashboard")}</Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
        <button
          type="button"
          onClick={goBack}
          disabled={createProperty.isPending}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-900 transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? t("previousStep") : t("backToDashboard")}
        </button>

        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <FormStepper
            title={t("newTitle")}
            step={step}
            onSelect={(s) => !createProperty.isPending && s < step && goTo(s)}
            stepLabel={(key) => t(`steps.${key}`)}
            progressLabel={t("stepOf", { step, total: STEP_KEYS.length })}
          />

          <fieldset disabled={createProperty.isPending} className="card min-w-0 p-5 sm:p-8 relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-900 via-amber-400 to-teal-900" />

            {step === 1 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start [&>*]:min-w-0">
                <BasicsSection data={formData} onChange={updateField} errors={errors} />
                <TextsSection data={formData} onChange={updateField} errors={errors} />
              </div>
            )}
            {step === 2 && <LocationSection data={formData} onChange={updateField} />}
            {step === 3 && <DetailsSection data={formData} onChange={updateField} errors={errors} />}
            {step === 4 && <AmenitiesSection data={formData} onChange={updateField} />}
            {step === 5 && (
              <div className="space-y-6">
                <SectionTitle>{t("sections.photos")}</SectionTitle>
                <ImageDropzone images={images} onChange={setImages} onError={setSubmitError} disabled={createProperty.isPending} />
                <ListingTermsConsent
                  alreadyAccepted={termsAlreadyAccepted}
                  acceptedAt={currentUser?.listingTermsAcceptedAt}
                  checked={acceptTerms}
                  onCheckedChange={(value) => {
                    setAcceptTerms(value);
                    if (value) setTermsError(false);
                  }}
                  showError={termsError}
                />
              </div>
            )}

            {(submitError || errors.title) && (
              <Alert variant="destructive" className="mt-6">
                <AlertDescription>{submitError ?? errors.title}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mt-8 pt-6 border-t border-dashed border-teal-900/15">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => goTo(step - 1)} className="px-6 h-11 rounded-xl">
                  {t("previousStep")}
                </Button>
              )}
              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createProperty.isPending}
                  className="flex-1 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createProperty.isPending ? t("creating") : t("create")}
                </Button>
              ) : (
                <Button type="button" onClick={goNext} className="flex-1 h-11 rounded-xl bg-teal-900 hover:bg-teal-800">
                  {t("steps." + STEP_KEYS[step])}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

export default function CreatePropertyPage() {
  return <Suspense fallback={<PageLoader />}><CreatePropertyContent /></Suspense>;
}
