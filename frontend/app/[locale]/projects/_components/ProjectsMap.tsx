"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocale, useTranslations } from "next-intl";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/constants/env";
import { useProjectsMap } from "@/lib/hooks/useProjects";
import { thumbnailUrl } from "@/lib/utils/image-utils";
import { formatUsd } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants/routes";
import { parseLocation } from "@/app/[locale]/properties/_components/form/PropertyFormSections";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/** All published projects with a pin on one Mapbox map, with popups. */
export function ProjectsMap() {
  const t = useTranslations("projects");
  const locale = useLocale();
  const { data: items = [], isLoading } = useProjectsMap(locale);
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
        ? t("priceFromSqm", { price: formatUsd(item.pricePerSqmFrom) })
        : t("priceOnRequest");
      const popup = new mapboxgl.Popup({ offset: 24, maxWidth: "260px" }).setHTML(
        `<a href="${ROUTES.PROJECT(item.slug)}" style="display:block;text-decoration:none;color:#042f2e;font-family:inherit">
          ${cover ? `<img src="${cover}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ""}
          <div style="font-weight:700;font-size:14px;line-height:1.2">${escapeHtml(item.title ?? item.slug)}</div>
          <div style="font-size:12px;color:#0f766e;margin-top:2px">${escapeHtml(item.developer.name)}${item.regionName ? " · " + escapeHtml(item.regionName) : ""}</div>
          <div style="font-size:13px;font-weight:700;color:#b45309;margin-top:6px">${escapeHtml(price)}</div>
        </a>`,
      );
      const el = document.createElement("div");
      el.className = "buildup-marker";
      el.style.cssText = `background:${item.hotSale ? "#ef4444" : "#134e4a"};color:#fbbf24;border:2px solid #fbbf24;border-radius:999px;padding:4px 8px;font:700 11px/1 system-ui;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer;white-space:nowrap`;
      el.textContent = item.pricePerSqmFrom ? `$${Math.round(item.pricePerSqmFrom / 100) / 10}k` : "•";
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
  }, [items, t]);

  if (!MAPBOX_ACCESS_TOKEN) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-teal-100 bg-white h-[70vh] min-h-[420px]">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" />
        </div>
      )}
      {!isLoading && items.length === 0 && (
        <div className="absolute inset-x-0 top-4 flex justify-center pointer-events-none">
          <span className="bg-white/95 border border-teal-100 rounded-full px-4 py-1.5 text-sm text-teal-800 shadow">
            {t("empty")}
          </span>
        </div>
      )}
    </div>
  );
}
