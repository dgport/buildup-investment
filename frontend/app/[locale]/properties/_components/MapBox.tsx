"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Layers } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/constants/env";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  enable3D?: boolean;
  defaultView?: "2d" | "3d";
  pitch3D?: number;
  bearing3D?: number;
  markerColor?: string;
  className?: string;
  labels?: { view2d: string; view3d: string };
}

export default function MapboxMap({
  latitude,
  longitude,
  zoom = 16,
  enable3D = true,
  defaultView = "3d",
  pitch3D = 60,
  bearing3D = -20,
  markerColor = "#d97706",
  className = "w-full h-full",
  labels = { view2d: "2D", view3d: "3D" },
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [is3D, setIs3D] = useState(defaultView === "3d");

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !MAPBOX_ACCESS_TOKEN)
      return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom,
      pitch: is3D ? pitch3D : 0,
      bearing: is3D ? bearing3D : 0,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    markerRef.current = new mapboxgl.Marker({ color: markerColor, scale: 1.2 })
      .setLngLat([longitude, latitude])
      .addTo(map);

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
              "fill-extrusion-opacity": 0.8,
            },
          },
          labelLayerId,
        );
      }
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.easeTo({
      pitch: is3D ? pitch3D : 0,
      bearing: is3D ? bearing3D : 0,
      duration: 800,
    });
  }, [is3D, pitch3D, bearing3D]);

  if (!MAPBOX_ACCESS_TOKEN) return null;

  return (
    <div className="relative h-full">
      <div ref={mapContainerRef} className={className} />

      {enable3D && (
        <button
          type="button"
          onClick={() => setIs3D((prev) => !prev)}
          className="absolute top-4 left-4 bg-white/95 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-white transition-colors z-10"
        >
          <Layers size={16} />
          {is3D ? labels.view2d : labels.view3d}
        </button>
      )}
    </div>
  );
}
