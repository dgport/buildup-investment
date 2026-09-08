"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { AMENITY_KEYS, type Property } from "@/lib/types/properties";

export function AmenitiesFeaturesSection({ property }: { property: Property }) {
  const t = useTranslations("properties");
  const available = AMENITY_KEYS.filter((key) => property[key] === true);
  if (!available.length) return null;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">
        {t("amenitiesTitle")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {available.map((key) => (
          <div key={key} className="flex items-center gap-2 text-teal-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span className="text-sm">{t(`amenities.${key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
