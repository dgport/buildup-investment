import { API_BASE_URL } from "./constants/env";
import { MARKET } from "./market";

export type SearchValues = Record<string, string | string[] | undefined>;
export function searchString(values: SearchValues) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  }
  return params.toString();
}
export async function catalogueData(kind: "properties" | "projects", values: SearchValues, locale: string) {
  const allowed = kind === "properties"
    ? ["page", "sort", "propertyType", "dealType", "region", "externalId", "priceFrom", "priceTo", "areaFrom", "areaTo", "rooms", "bedrooms"]
    : ["page", "sort", "search", "region", "developer", "status", "rooms", "pricePerSqmFrom", "pricePerSqmTo", "deliveryYear"];
  const params = new URLSearchParams({ page: "1", limit: "12", lang: locale });
  for (const key of allowed) if (typeof values[key] === "string") params.set(key, values[key]);
  if (kind === "properties") params.set("market", MARKET);
  const res = await fetch(`${API_BASE_URL}/${kind}?${params}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Catalogue request failed: ${res.status}`);
  return res.json();
}
