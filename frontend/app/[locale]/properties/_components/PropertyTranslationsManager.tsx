"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { Edit, Save, AlertCircle } from "lucide-react";
import {
  usePropertyTranslations,
  useUpsertPropertyTranslation,
} from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/api";
import type {
  PropertyTranslation,
  UpsertPropertyTranslationDto,
} from "@/lib/types/properties";

interface PropertyTranslationsManagerProps {
  propertyId: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function PropertyTranslationsManager({
  propertyId,
  onDirtyChange,
}: PropertyTranslationsManagerProps) {
  const fieldId = useId();
  const confirm = useConfirm();
  const tf = useTranslations("dashboard.form");
  const t = useTranslations("dashboard.translations");
  const tl = useTranslations("common.language");
  const ta = useTranslations("common.actions");

  const [editing, setEditing] = useState<UpsertPropertyTranslationDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: translations = [], isLoading, isError, refetch } =
    usePropertyTranslations(propertyId);
  const upsertTranslation = useUpsertPropertyTranslation();

  const source = translations.find((translation) => translation.language === editing?.language);
  const dirty = !!editing && (editing.title !== (source?.title ?? "") || (editing.address ?? "") !== (source?.address ?? "") || (editing.description ?? "") !== (source?.description ?? ""));
  useUnsavedChanges(dirty);
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);
  const startEditing = async (translation: PropertyTranslation) => {
    if (upsertTranslation.isPending || (dirty && !(await confirm({ description: tf("unsavedConfirm") })))) return;
    setError(null);
    setEditing({ language: translation.language, title: translation.title, address: translation.address ?? "", description: translation.description ?? "" });
  };

  const languageLabel = (code: string) =>
    (["ka", "en", "ru"] as const).includes(code as "ka") ? tl(code as "ka") : code;

  const handleSave = async () => {
    if (!editing?.title?.trim() || upsertTranslation.isPending) return;
    setError(null);
    try {
      await upsertTranslation.mutateAsync({
        id: propertyId,
        data: {
          ...editing,
          title: editing.title.trim(),
          address: editing.address?.trim() || undefined,
          description: editing.description?.trim() || undefined,
        },
      });
      setEditing(null);
    } catch (err) {
      setError(getErrorMessage(err, t("saveFailed")));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (isError) return <div role="alert" className="space-y-3 text-center py-8"><p>{t("loadFailed")}</p><Button type="button" variant="outline" onClick={() => refetch()}>{ta("retry")}</Button></div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900">{t("title")}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {translations.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl py-8 text-center">
          <p className="text-sm text-gray-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {translations.map((tr: PropertyTranslation) =>
            editing?.language === tr.language ? (
              <fieldset
                disabled={upsertTranslation.isPending}
                key={tr.language}
                className="min-w-0 rounded-xl border border-teal-200 bg-teal-50/30 p-4 sm:p-5 space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-language`}>{t("language")}</Label>
                  <Input id={`${fieldId}-language`} value={languageLabel(editing.language)} disabled className="bg-gray-100" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-title`}>
                    {t("titleLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`${fieldId}-title`}
                    required
                    value={editing.title}
                    maxLength={200}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, title: e.target.value })
                    }
                    placeholder={t("titlePlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-address`}>{t("address")}</Label>
                  <Input
                    id={`${fieldId}-address`}
                    value={editing.address ?? ""}
                    maxLength={300}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, address: e.target.value })
                    }
                    placeholder={t("addressPlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${fieldId}-description`}>{t("descriptionLabel")}</Label>
                  <Textarea
                    id={`${fieldId}-description`}
                    value={editing.description ?? ""}
                    maxLength={5000}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, description: e.target.value })
                    }
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    {ta("cancel")}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={upsertTranslation.isPending || !editing.title?.trim()}
                    className="bg-teal-900 hover:bg-teal-800"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {upsertTranslation.isPending ? ta("saving") : ta("save")}
                  </Button>
                </div>
              </fieldset>
            ) : (
              <div
                key={tr.language}
                className="rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {languageLabel(tr.language)}
                    </p>
                    {!tr.title && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {t("missing")}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">
                    {tr.title || (
                      <span className="text-gray-400 italic">{t("noTitle")}</span>
                    )}
                  </p>
                  {tr.address && (
                    <p className="text-xs text-gray-500 truncate">{tr.address}</p>
                  )}
                  {tr.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {tr.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={ta("edit")}
                  disabled={upsertTranslation.isPending}
                  onClick={() => void startEditing(tr)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
