"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale, useTranslations } from "next-intl";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/constants/env";
import type { ProjectMapItem } from "@/lib/types/projects";
import { thumbnailUrl, resolveImageUrl } from "@/lib/utils/image-utils";
import { formatMoney, useCurrency } from "@/lib/currency";
import { ROUTES } from "@/lib/constants/routes";
import { parseLocation } from "@/lib/utils/location";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

/** The same filtered page as the list view, with keyboard-accessible markers. */
export function ProjectsMap({ items }: { items: ProjectMapItem[] }) {
  const { currency, exchangeRate } = useCurrency();
  const t = useTranslations("projects");
  const locale = useLocale();
  const pinCount = items.filter((item) => parseLocation(item.location)).length;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !MAPBOX_ACCESS_TOKEN) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [41.6168, 41.6401],
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    for (const item of items) {
      const coords = parseLocation(item.location);
      if (!coords) continue;
      const cover = thumbnailUrl(item.coverImage);
      const price = item.pricePerSqmFrom
        ? t("priceFromSqm", { price: formatMoney(item.pricePerSqmFrom, currency, exchangeRate)! })
        : t("priceOnRequest");
      const link = document.createElement("a");
      link.href = `${locale === "en" ? "/en" : ""}${ROUTES.PROJECT(encodeURIComponent(item.slug))}`;
      link.style.cssText = "display:block;text-decoration:none;color:#042f2e;font-family:inherit";
      if (cover) {
        const image = document.createElement("img");
        image.src = cover;
        image.alt = "";
        image.addEventListener("error", () => { const full = resolveImageUrl(item.coverImage); if (full && image.src !== full) image.src = full; }, { once: true });
        image.style.cssText = "width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px";
        link.append(image);
      }
      for (const [text, style] of [
        [item.title ?? item.slug, "font-weight:700;font-size:14px;line-height:1.2"],
        [[item.developer.name, item.regionName].filter(Boolean).join(" · "), "font-size:12px;color:#0f766e;margin-top:2px"],
        [price, "font-size:13px;font-weight:700;color:#b45309;margin-top:6px"],
      ]) {
        const line = document.createElement("div"); line.textContent = text; line.style.cssText = style; link.append(line);
      }
      const popup = new mapboxgl.Popup({ offset: 24, maxWidth: "260px" }).setDOMContent(link);
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", item.title ?? item.slug);
      el.className = "buildup-marker";
      el.style.cssText = `background:${item.hotSale ? "#ef4444" : "#134e4a"};color:#fbbf24;border:2px solid #fbbf24;border-radius:999px;padding:8px 12px;min-height:44px;min-width:44px;font:700 11px/1 system-ui;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer;white-space:nowrap`;
      el.textContent = formatMoney(item.pricePerSqmFrom, currency, exchangeRate) ?? "•";
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([coords.lng, coords.lat]);
    }
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    }
  }, [items, t, currency, exchangeRate, locale]);

  if (!MAPBOX_ACCESS_TOKEN) return <p className="card p-8 text-center text-teal-800">{t("mapUnavailable")}</p>;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-teal-100 bg-white h-[70vh] min-h-[360px] mb-8">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none">
          <span className="max-w-[calc(100%-2rem)] text-center bg-white/95 border border-teal-100 rounded-xl px-4 py-1.5 text-xs sm:text-sm text-teal-800 shadow">
            {t("mapPagePins", { count: pinCount, total: items.length })}
          </span>
      </div>
    </div>
  );
}
