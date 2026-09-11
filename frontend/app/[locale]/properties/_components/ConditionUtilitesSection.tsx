"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Car, Droplet, Thermometer, Users, Wrench } from "lucide-react";
import type { Property } from "@/lib/types/properties";
import { DetailSection, SpecTile } from "./DetailSection";

export function ConditionUtilitiesSection({ property }: { property: Property }) {
  const t = useTranslations("properties");

  const items = [
    {
      icon: Users,
      accent: "sky" as const,
      label: t("fields.occupancy"),
      value: property.occupancy ? t(`enums.occupancy.${property.occupancy}`) : null,
    },
    {
      icon: Thermometer,
      accent: "amber" as const,
      label: t("fields.heating"),
      value: property.heating ? t(`enums.heating.${property.heating}`) : null,
    },
    {
      icon: Droplet,
      accent: "sky" as const,
      label: t("fields.hotWater"),
      value: property.hotWater ? t(`enums.hotWater.${property.hotWater}`) : null,
    },
    {
      icon: Car,
      accent: "violet" as const,
      label: t("fields.parking"),
      value: property.parking ? t(`enums.parking.${property.parking}`) : null,
    },
  ].filter((i) => i.value);

  if (!items.length && !property.isNonStandard) return null;

  return (
    <DetailSection icon={Wrench} title={t("conditionTitle")} accent="sky">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map(({ icon, accent, label, value }) => (
          <SpecTile key={label} icon={icon} accent={accent} label={label} value={value} />
        ))}
        {property.isNonStandard && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-800">{t("fields.nonStandard")}</p>
          </div>
        )}
      </div>
    </DetailSection>
  );
}
