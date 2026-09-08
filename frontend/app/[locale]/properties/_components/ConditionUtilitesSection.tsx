"use client";

import { useTranslations } from "next-intl";
import type { Property } from "@/lib/types/properties";
import { Thermometer, Droplet, Car, Users } from "lucide-react";

export function ConditionUtilitiesSection({
  property,
}: {
  property: Property;
}) {
  const t = useTranslations("properties");

  const items = [
    {
      icon: Users,
      label: t("fields.occupancy"),
      value: property.occupancy
        ? t(`enums.occupancy.${property.occupancy}`)
        : null,
    },
    {
      icon: Thermometer,
      label: t("fields.heating"),
      value: property.heating ? t(`enums.heating.${property.heating}`) : null,
    },
    {
      icon: Droplet,
      label: t("fields.hotWater"),
      value: property.hotWater ? t(`enums.hotWater.${property.hotWater}`) : null,
    },
    {
      icon: Car,
      label: t("fields.parking"),
      value: property.parking ? t(`enums.parking.${property.parking}`) : null,
    },
  ].filter((i) => i.value);

  if (!items.length && !property.isNonStandard) return null;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">
        {t("conditionTitle")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2 p-2.5 bg-teal-50/50 rounded-lg"
          >
            <Icon className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-teal-700/70">{label}</p>
              <p className="text-sm font-semibold text-teal-950 truncate">
                {value}
              </p>
            </div>
          </div>
        ))}
        {property.isNonStandard && (
          <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-200 flex items-center">
            <p className="text-sm font-semibold text-orange-700">
              {t("fields.nonStandard")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
