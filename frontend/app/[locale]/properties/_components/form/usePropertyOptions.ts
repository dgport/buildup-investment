"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  PropertyType,
  DealType,
  HeatingType,
  HotWaterType,
  ParkingType,
  Occupancy,
  Region,
  AMENITY_KEYS,
  PROPERTY_LANGUAGES,
} from "@/lib/types/properties";
import type { SelectOption } from "./FormPrimitives";

/** Translated option lists for every enum used in the property forms. */
export function usePropertyOptions() {
  const t = useTranslations("properties");
  const tc = useTranslations("common");

  return useMemo(() => {
    type Key = Parameters<typeof t>[0];
    const build = (values: string[], ns: string): SelectOption[] =>
      values.map((value) => ({
        value,
        label: t(`enums.${ns}.${value}` as Key),
      }));

    return {
      propertyTypes: build(Object.values(PropertyType), "propertyType"),
      dealTypes: build(Object.values(DealType), "dealType"),
      regions: build(Object.values(Region), "region"),
      heating: build(Object.values(HeatingType), "heating"),
      hotWater: build(Object.values(HotWaterType), "hotWater"),
      parking: build(Object.values(ParkingType), "parking"),
      occupancy: build(Object.values(Occupancy), "occupancy"),
      amenities: AMENITY_KEYS.map((key) => ({
        key,
        label: t(`amenities.${key}`),
      })),
      languages: PROPERTY_LANGUAGES.map((code) => ({
        code,
        label: tc(`language.${code}`),
      })),
    };
  }, [t, tc]);
}
