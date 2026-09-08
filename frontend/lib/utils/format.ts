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
