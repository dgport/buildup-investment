const KA_MONTHS = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];
const KA_MONTHS_SHORT = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];

/**
 * Locale-aware date: "8 სექტემბერი, 2026" / "8 September 2026".
 * Georgian is formatted by hand because many browsers ship without ka ICU
 * data and silently fall back to US English.
 */
export const formatDate = (
  value: string | Date,
  locale: string,
  style: "long" | "medium" | "short" = "long",
): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  if (locale === "ka") {
    const day = d.getDate();
    const year = d.getFullYear();
    if (style === "short") return `${day} ${KA_MONTHS_SHORT[d.getMonth()]}`;
    if (style === "medium") return `${day} ${KA_MONTHS_SHORT[d.getMonth()]}, ${year}`;
    return `${day} ${KA_MONTHS[d.getMonth()]}, ${year}`;
  }
  if (style === "short") return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return d.toLocaleDateString("en-GB", { dateStyle: style });
};

/** Date + time, e.g. "8 სექ, 2026 · 14:28" / "8 Sept 2026 · 14:28". */
export const formatDateTime = (value: string | Date, locale: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${formatDate(d, locale, "medium")} · ${time}`;
};

/** "$1,250" style USD formatting (no decimals). */
export const formatUsd = (value: number | null | undefined): string =>
  value == null ? "" : `$${Math.round(value).toLocaleString("en-US")}`;

/** "68" / "68–75" area range. */
export const formatAreaRange = (from: number, to?: number | null): string =>
  to && to > from ? `${from}–${to}` : `${from}`;

/** "5–40" floor range. */
export const formatRange = (from?: number | null, to?: number | null): string | null => {
  if (from == null && to == null) return null;
  if (from != null && to != null && to !== from) return `${from}–${to}`;
  return String(from ?? to);
};

/** YouTube / Vimeo page URL → embeddable URL, or null when unknown. */
export const toEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.match(/\/(embed|shorts)\/([^/]+)/)?.[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === "player.vimeo.com") return url;
  } catch {
    return null;
  }
  return null;
};
