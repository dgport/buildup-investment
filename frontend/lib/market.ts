import { DealType } from "./types/properties";

export const IS_RENT_SITE = process.env.NEXT_PUBLIC_SITE_MODE === "rent";
export const MARKET = IS_RENT_SITE ? "rent" : "sale";
export const parseMarket = (value: string | null) =>
  value === "sale" || value === "rent" ? value : undefined;
export const SALES_URL = "https://buildup.ge";
export const RENT_URL = "https://rent.buildup.ge";
export const MARKET_DEAL_TYPES = IS_RENT_SITE
  ? [DealType.RENT, DealType.DAILY_RENT]
  : [DealType.SALE];

export function propertySiteUrl(property: { id: string; dealType: string }) {
  return `${property.dealType === DealType.SALE ? SALES_URL : RENT_URL}/properties/${property.id}`;
}
