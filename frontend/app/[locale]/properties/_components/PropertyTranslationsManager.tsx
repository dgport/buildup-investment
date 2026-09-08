"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
}

export function PropertyTranslationsManager({
  propertyId,
}: PropertyTranslationsManagerProps) {
  const t = useTranslations("dashboard.translations");
  const tl = useTranslations("common.language");
  const ta = useTranslations("common.actions");

  const [editing, setEditing] = useState<UpsertPropertyTranslationDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: translations = [], isLoading } =
    usePropertyTranslations(propertyId);
  const upsertTranslation = useUpsertPropertyTranslation();

  const languageLabel = (code: string) =>
    (["ka", "en", "ru"] as const).includes(code as "ka") ? tl(code as "ka") : code;

  const handleSave = async () => {
    if (!editing?.title?.trim()) return;
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
              <div
                key={tr.language}
                className="rounded-xl border border-teal-200 bg-teal-50/30 p-5 space-y-4"
              >
                <div className="space-y-1.5">
                  <Label>{t("language")}</Label>
                  <Input value={languageLabel(editing.language)} disabled className="bg-gray-100" />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    {t("titleLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={editing.title}
                    maxLength={200}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, title: e.target.value })
                    }
                    placeholder={t("titlePlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("address")}</Label>
                  <Input
                    value={editing.address ?? ""}
                    maxLength={300}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, address: e.target.value })
                    }
                    placeholder={t("addressPlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("descriptionLabel")}</Label>
                  <Textarea
                    value={editing.description ?? ""}
                    maxLength={5000}
                    onChange={(e) =>
                      setEditing((prev) => prev && { ...prev, description: e.target.value })
                    }
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 justify-end">
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
              </div>
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
                  onClick={() =>
                    setEditing({
                      language: tr.language,
                      title: tr.title,
                      address: tr.address ?? undefined,
                      description: tr.description ?? undefined,
                    })
                  }
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
