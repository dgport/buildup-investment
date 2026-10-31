export type CatalogueKind = "properties" | "projects";
const numeric = ["page", "priceFrom", "priceTo", "areaFrom", "areaTo", "rooms", "bedrooms", "pricePerSqmFrom", "pricePerSqmTo", "deliveryYear"];
const enums: Record<string, string[]> = {
  region: ["BATUMI", "KOBULETI", "CHAKVI", "MAKHINJAURI", "GONIO", "UREKI"],
  propertyType: ["APARTMENT", "VILLA", "COMMERCIAL", "LAND", "HOTEL"],
  dealType: ["SALE", "RENT", "DAILY_RENT"],
  status: ["PLANNED", "UNDER_CONSTRUCTION", "COMPLETED"],
};
export function normalizeCatalogueQuery(input: URLSearchParams, kind: CatalogueKind) {
  const params = new URLSearchParams(input);
  for (const key of numeric) {
    const raw = params.get(key);
    if (raw === null) continue;
    const n = Number(raw);
    if (!raw.trim() || !Number.isSafeInteger(n) || n < (key === "page" ? 1 : 0) || n > (key === "page" ? 100000 : 2147483647)) params.delete(key);
    else params.set(key, String(n));
  }
  for (const [key, values] of Object.entries(enums)) {
    const value = params.get(key);
    if (value !== null && !values.includes(value)) params.delete(key);
  }
  const sorts = kind === "properties" ? ["featured", "newest", "price_asc", "price_desc", "area_desc"] : ["featured", "newest", "price_asc", "price_desc", "delivery"];
  if (params.has("sort") && !sorts.includes(params.get("sort")!)) params.delete("sort");
  for (const [min, max] of [["priceFrom", "priceTo"], ["areaFrom", "areaTo"], ["pricePerSqmFrom", "pricePerSqmTo"]]) {
    if (params.has(min) && params.has(max) && Number(params.get(min)) > Number(params.get(max))) {
      const lower = params.get(max)!; params.set(max, params.get(min)!); params.set(min, lower);
    }
  }
  return params;
}
