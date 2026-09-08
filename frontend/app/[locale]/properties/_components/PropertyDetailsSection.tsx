"use client";

import { useTranslations } from "next-intl";
import type { Property } from "@/lib/types/properties";
import {
  Square,
  Home,
  Bed,
  Bath,
  Layers,
  ArrowUpDown,
  Ruler,
} from "lucide-react";

export function PropertyDetailsSection({ property }: { property: Property }) {
  const t = useTranslations("properties");

  const items = [
    {
      icon: Square,
      label: t("fields.totalArea"),
      value: property.totalArea ? `${property.totalArea} m²` : null,
    },
    { icon: Home, label: t("fields.rooms"), value: property.rooms },
    { icon: Bed, label: t("fields.bedrooms"), value: property.bedrooms },
    { icon: Bath, label: t("fields.bathrooms"), value: property.bathrooms },
    {
      icon: Layers,
      label: t("fields.floor"),
      value:
        property.floors != null
          ? property.floorsTotal
            ? `${property.floors} / ${property.floorsTotal}`
            : property.floors
          : null,
    },
    {
      icon: ArrowUpDown,
      label: t("fields.floorsTotal"),
      value: property.floors == null ? property.floorsTotal : null,
    },
    {
      icon: Ruler,
      label: t("fields.ceilingHeight"),
      value: property.ceilingHeight ? `${property.ceilingHeight} m` : null,
    },
    {
      icon: Square,
      label: t("fields.balconyArea"),
      value: property.balconyArea ? `${property.balconyArea} m²` : null,
    },
  ].filter((item) => item.value != null && item.value !== 0);

  if (!items.length) return null;

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">
        {t("detailsTitle")}
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
              <p className="text-sm font-semibold text-teal-950">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
