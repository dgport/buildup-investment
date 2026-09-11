"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Bath, Bed, Home, Layers, LayoutPanelTop, Ruler, Square } from "lucide-react";
import type { Property } from "@/lib/types/properties";
import { DetailSection, SpecTile } from "./DetailSection";

export function PropertyDetailsSection({ property }: { property: Property }) {
  const t = useTranslations("properties");

  const items = [
    {
      icon: Square,
      accent: "teal" as const,
      label: t("fields.totalArea"),
      value: property.totalArea ? `${property.totalArea} m²` : null,
    },
    { icon: Home, accent: "amber" as const, label: t("fields.rooms"), value: property.rooms },
    { icon: Bed, accent: "sky" as const, label: t("fields.bedrooms"), value: property.bedrooms },
    { icon: Bath, accent: "violet" as const, label: t("fields.bathrooms"), value: property.bathrooms },
    {
      icon: Layers,
      accent: "teal" as const,
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
      accent: "teal" as const,
      label: t("fields.floorsTotal"),
      value: property.floors == null ? property.floorsTotal : null,
    },
    {
      icon: Ruler,
      accent: "amber" as const,
      label: t("fields.ceilingHeight"),
      value: property.ceilingHeight ? `${property.ceilingHeight} m` : null,
    },
    {
      icon: LayoutPanelTop,
      accent: "sky" as const,
      label: t("fields.balconyArea"),
      value: property.balconyArea ? `${property.balconyArea} m²` : null,
    },
  ].filter((item) => item.value != null && item.value !== 0);

  if (!items.length) return null;

  return (
    <DetailSection icon={LayoutPanelTop} title={t("detailsTitle")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map(({ icon, accent, label, value }) => (
          <SpecTile key={label} icon={icon} accent={accent} label={label} value={value} />
        ))}
      </div>
    </DetailSection>
  );
}
