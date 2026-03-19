"use client";

import { useState } from "react";
import { Edit, Save } from "lucide-react";
import {
  usePropertyTranslations,
  useUpsertPropertyTranslation,
} from "@/lib/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type {
  PropertyTranslation,
  UpsertPropertyTranslationDto,
} from "@/lib/types/properties";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ka: "Georgian",
  ru: "Russian",
};

interface PropertyTranslationsManagerProps {
  propertyId: string;
}

export function PropertyTranslationsManager({
  propertyId,
}: PropertyTranslationsManagerProps) {
  const [editing, setEditing] = useState<UpsertPropertyTranslationDto | null>(
    null,
  );

  const { data: translations = [], isLoading } =
    usePropertyTranslations(propertyId);
  const upsertTranslation = useUpsertPropertyTranslation();

  const handleSave = async () => {
    if (!editing?.title?.trim()) return;
    try {
      await upsertTranslation.mutateAsync({ id: propertyId, data: editing });
      setEditing(null);
    } catch (err) {
      console.error("Error saving translation:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading translations…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Property Translations</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage title, address and description in each language
        </p>
      </div>

      {translations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No translations available
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {translations.map((t: PropertyTranslation) =>
            editing?.language === t.language ? (
              <Card key={t.language}>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Input
                      value={
                        LANGUAGE_LABELS[editing.language] ?? editing.language
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={editing.title}
                      onChange={(e) =>
                        setEditing(
                          (prev) => prev && { ...prev, title: e.target.value },
                        )
                      }
                      placeholder="Property title"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input
                      value={editing.address ?? ""}
                      onChange={(e) =>
                        setEditing(
                          (prev) =>
                            prev && {
                              ...prev,
                              address: e.target.value || undefined,
                            },
                        )
                      }
                      placeholder="Address in this language"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      value={editing.description ?? ""}
                      onChange={(e) =>
                        setEditing(
                          (prev) =>
                            prev && {
                              ...prev,
                              description: e.target.value || undefined,
                            },
                        )
                      }
                      placeholder="Description in this language"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={
                        upsertTranslation.isPending || !editing.title?.trim()
                      }
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {upsertTranslation.isPending ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={t.language}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {LANGUAGE_LABELS[t.language] ?? t.language}
                      </p>
                      <p className="font-medium text-sm">
                        {t.title || (
                          <span className="text-muted-foreground italic">
                            No title
                          </span>
                        )}
                      </p>
                      {t.address && (
                        <p className="text-xs text-muted-foreground">
                          {t.address}
                        </p>
                      )}
                      {t.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditing({
                          language: t.language,
                          title: t.title,
                          address: t.address ?? undefined,
                          description: t.description ?? undefined,
                        })
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
