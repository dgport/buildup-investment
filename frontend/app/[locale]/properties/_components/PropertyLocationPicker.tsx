"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useTranslations } from "next-intl";
import { MapPin, Layers, X, Check } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/constants/env";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

/** Batumi city centre, [lng, lat] */
const DEFAULT_CENTER: [number, number] = [41.6168, 41.6401];
const DEFAULT_ZOOM = 14;

interface PropertyLocationPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number]; // [lng, lat]
    address: string;
  }) => void;
  onClose: () => void;
  initialLocation?: { lng: number; lat: number } | null;
}

export function PropertyLocationPicker({
  onLocationSelect,
  onClose,
  initialLocation,
}: PropertyLocationPickerProps) {
  const t = useTranslations("dashboard.map");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(
    initialLocation ?? null,
  );
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_ACCESS_TOKEN) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialLocation
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_CENTER,
      zoom: initialLocation ? 16 : DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({ trackUserLocation: false }),
      "top-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      const labelLayerId = map
        .getStyle()
        .layers?.find(
          (l) =>
            l.type === "symbol" &&
            (l.layout as Record<string, unknown> | undefined)?.["text-field"],
        )?.id;

      if (!map.getLayer("3d-buildings")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#c9daf8",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.75,
            },
          },
          labelLayerId,
        );
      }
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lng, lat });
      placeMarker(map, lng, lat);
      reverseGeocode(lng, lat);
    });

    if (initialLocation) {
      placeMarker(map, initialLocation.lng, initialLocation.lat);
      reverseGeocode(initialLocation.lng, initialLocation.lat);
    }

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeMarker = (map: mapboxgl.Map, lng: number, lat: number) => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
      return;
    }
    markerRef.current = new mapboxgl.Marker({ color: "#d97706", draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current.on("dragend", () => {
      const pos = markerRef.current?.getLngLat();
      if (!pos) return;
      setCoords({ lng: pos.lng, lat: pos.lat });
      reverseGeocode(pos.lng, pos.lat);
    });
  };

  const toggle3D = () => {
    if (!mapRef.current) return;
    const next = !is3D;
    setIs3D(next);
    mapRef.current.easeTo({
      pitch: next ? 60 : 0,
      bearing: next ? -20 : 0,
      duration: 800,
    });
  };

  const reverseGeocode = async (lng: number, lat: number) => {
    setLoading(true);
    const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address,poi,place&language=ka,en&access_token=${MAPBOX_ACCESS_TOKEN}`,
      );
      const data = await res.json();
      setAddress(data.features?.[0]?.place_name ?? fallback);
    } catch {
      setAddress(fallback);
    } finally {
      setLoading(false);
    }
  };

  const confirmLocation = () => {
    if (!coords) return;
    onLocationSelect({
      coordinates: [coords.lng, coords.lat],
      address: address || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 w-full max-w-6xl h-[92vh] rounded-2xl overflow-hidden border border-slate-700 flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin className="text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
              <p className="text-sm text-slate-400">{t("hint")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="text-slate-300 w-5 h-5" />
          </button>
        </header>

        <div className="relative flex-1">
          {MAPBOX_ACCESS_TOKEN ? (
            <div ref={mapContainerRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm px-6 text-center">
              {t("noToken")}
            </div>
          )}
          <button
            type="button"
            onClick={toggle3D}
            className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Layers className="w-4 h-4" />
            {is3D ? "2D" : "3D"}
          </button>
        </div>

        <footer className="px-4 sm:px-8 py-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="flex-1 min-w-[200px] text-sm truncate">
              {loading ? (
                <span className="text-slate-400">{t("resolving")}</span>
              ) : address ? (
                <span className="text-white">{address}</span>
              ) : (
                <span className="text-slate-500">{t("noSelection")}</span>
              )}
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={confirmLocation}
                disabled={!coords || loading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 text-teal-950 text-sm font-semibold transition-colors"
              >
                <Check className="w-4 h-4" />
                {t("confirm")}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
