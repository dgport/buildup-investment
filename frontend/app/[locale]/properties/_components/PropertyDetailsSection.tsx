"use client";

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
  const hasDetails = Boolean(
    property.totalArea ||
    property.rooms ||
    property.bedrooms ||
    property.bathrooms ||
    property.floors ||
    property.floorsTotal ||
    property.ceilingHeight ||
    property.balconyArea,
  );

  if (!hasDetails) return null;

  const items = [
    {
      icon: Square,
      label: "Total Area",
      value: property.totalArea ? `${property.totalArea} m²` : null,
    },
    { icon: Home, label: "Rooms", value: property.rooms },
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Layers, label: "Floor", value: property.floors },
    { icon: ArrowUpDown, label: "Total Floors", value: property.floorsTotal },
    {
      icon: Ruler,
      label: "Ceiling Height",
      value: property.ceilingHeight ? `${property.ceilingHeight} m` : null,
    },
    {
      icon: Square,
      label: "Balcony Area",
      value: property.balconyArea ? `${property.balconyArea} m²` : null,
    },
  ].filter((item) => item.value != null);

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">
        Property Details
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg"
          >
            <Icon className="w-4 h-4 text-gray-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">{label}</p>
              <p className="text-xs md:text-sm font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
