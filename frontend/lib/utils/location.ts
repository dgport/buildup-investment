/** Stored coordinates are latitude,longitude. Reject partial or invalid pins. */
export function parseLocation(location?: string | null): { lat: number; lng: number } | null {
  if (!location) return null;
  const parts = location.split(",").map((part) => part.trim());
  if (parts.length !== 2 || parts.some((part) => part === "")) return null;
  const [lat, lng] = parts.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}
