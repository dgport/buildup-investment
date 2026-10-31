const integerFields = ["price", "totalArea", "rooms", "bedrooms", "bathrooms", "floors", "floorsTotal"] as const;
const decimalFields = ["ceilingHeight", "balconyArea"] as const;

/** Match the API's numeric contract before a multi-step form is submitted. */
export function invalidPropertyNumbers(data: Record<string, unknown>): string[] {
  return [...integerFields, ...decimalFields].filter((field) => {
    const value = data[field];
    if (value === undefined || value === null || value === "") return false;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return true;
    return (integerFields as readonly string[]).includes(field) && (!Number.isInteger(value) || value > 2147483647);
  });
}
