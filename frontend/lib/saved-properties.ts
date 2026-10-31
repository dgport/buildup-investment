/** Store only public listing IDs, never stale prices or private account data. */
export const SAVED_PROPERTIES_KEY = "buildup:saved-properties:v1";
export const SAVED_PROPERTIES_LIMIT = 50;

export function parseSavedProperties(value: string | null): string[] {
  if (!value) return [];
  try {
    const ids: unknown = JSON.parse(value);
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.filter((id): id is string =>
      typeof id === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(id),
    ))].slice(0, SAVED_PROPERTIES_LIMIT);
  } catch {
    return [];
  }
}

export function updateSavedProperties(ids: string[], id: string) {
  if (ids.includes(id)) return { ids: ids.filter((saved) => saved !== id), result: "removed" as const };
  if (ids.length >= SAVED_PROPERTIES_LIMIT) return { ids, result: "limit" as const };
  return { ids: [id, ...ids], result: "added" as const };
}
