import { notFound } from "next/navigation";

/**
 * Catch-all for unknown URLs. Throwing notFound() here renders
 * app/[locale]/not-found.tsx inside the locale layout (header, footer,
 * translations) instead of Next's bare default 404 page.
 */
export default function CatchAllPage() {
  notFound();
}
