"use client";

import { useTranslations } from "next-intl";
import { Check, Sparkles } from "lucide-react";
import { AMENITY_KEYS, type Property } from "@/lib/types/properties";
import { DetailSection } from "./DetailSection";

export function AmenitiesFeaturesSection({ property }: { property: Property }) {
  const t = useTranslations("properties");
  const available = AMENITY_KEYS.filter((key) => property[key] === true);
  if (!available.length) return null;

  return (
    <DetailSection
      icon={Sparkles}
      title={t("amenitiesTitle")}
      count={available.length}
      accent="amber"
    >
      <div className="flex flex-wrap gap-2">
        {available.map((key) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50/70 pl-2 pr-3 py-1.5 text-sm font-medium text-teal-900"
          >
            <span className="rounded-full bg-teal-900 p-0.5">
              <Check className="w-3 h-3 text-amber-300" />
            </span>
            {t(`amenities.${key}`)}
          </span>
        ))}
      </div>
    </DetailSection>
  );
}
