"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin, Layers, X, Check } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const DEFAULT_CENTER: [number, number] = [41.6168, 41.6401];
const DEFAULT_ZOOM = 16;

interface PropertyLocationPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number];
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // useRef for values used inside map event handlers to avoid stale closures
  const hoveredBuildingRef = useRef<string | null>(null);
  const selectedBuildingRef = useRef<string | null>(null);

  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(
    initialLocation ?? null,
  );
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialLocation
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      const labelLayerId = map
        .getStyle()
        .layers?.find(
          (l) => l.type === "symbol" && (l.layout as any)?.["text-field"],
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
              "fill-extrusion-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#22c55e",
                ["boolean", ["feature-state", "hover"], false],
                "#60a5fa",
                "#c9daf8",
              ],
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.8,
            },
          },
          labelLayerId,
        );
      }

      map.on("mousemove", "3d-buildings", (e) => {
        if (!e.features?.length) return;
        const buildingId = String(e.features[0].id);

        if (
          hoveredBuildingRef.current &&
          hoveredBuildingRef.current !== buildingId
        ) {
          map.setFeatureState(
            {
              source: "composite",
              sourceLayer: "building",
              id: hoveredBuildingRef.current,
            },
            { hover: false },
          );
        }

        hoveredBuildingRef.current = buildingId;
        map.setFeatureState(
          { source: "composite", sourceLayer: "building", id: buildingId },
          { hover: true },
        );
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "3d-buildings", () => {
        if (hoveredBuildingRef.current) {
          map.setFeatureState(
            {
              source: "composite",
              sourceLayer: "building",
              id: hoveredBuildingRef.current,
            },
            { hover: false },
          );
          hoveredBuildingRef.current = null;
        }
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "3d-buildings", (e) => {
        if (!e.features?.length) return;
        const buildingId = String(e.features[0].id);

        if (selectedBuildingRef.current) {
          map.setFeatureState(
            {
              source: "composite",
              sourceLayer: "building",
              id: selectedBuildingRef.current,
            },
            { selected: false },
          );
        }

        if (selectedBuildingRef.current === buildingId) {
          selectedBuildingRef.current = null;
        } else {
          selectedBuildingRef.current = buildingId;
          map.setFeatureState(
            { source: "composite", sourceLayer: "building", id: buildingId },
            { selected: true },
          );
        }
      });
    });

    map.on("click", handleMapClick);

    if (initialLocation) {
      addMarker(map, initialLocation.lng, initialLocation.lat);
      reverseGeocode(initialLocation.lng, initialLocation.lat);
    }

    return () => {
      markerRef.current?.remove();
      map.remove();
    };
  }, []);

  const addMarker = (map: mapboxgl.Map, lng: number, lat: number) => {
    markerRef.current?.remove();
    markerRef.current = new mapboxgl.Marker({ color: "#ff6b35" })
      .setLngLat([lng, lat])
      .addTo(map);
  };

  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setCoords({ lng, lat });
    if (mapRef.current) addMarker(mapRef.current, lng, lat);
    await reverseGeocode(lng, lat);
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
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      );
      const data = await res.json();
      setAddress(
        data.features?.[0]?.place_name ??
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      );
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmLocation = () => {
    if (!coords || !address) return;
    onLocationSelect({ coordinates: [coords.lng, coords.lat], address });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-slate-700 flex flex-col">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin className="text-cyan-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Select Location
              </h2>
              <p className="text-sm text-slate-400">
                Click on the map to place a pin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="text-slate-300 w-5 h-5" />
          </button>
        </header>

        <div className="relative flex-1">
          <div ref={mapContainerRef} className="w-full h-full" />
          <button
            onClick={toggle3D}
            className="absolute top-4 right-16 bg-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Layers className="w-4 h-4" />
            {is3D ? "2D" : "3D"}
          </button>
        </div>

        <footer className="px-8 py-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between gap-4">
            <p className="flex-1 text-sm truncate">
              {loading ? (
                <span className="text-slate-400">Resolving address…</span>
              ) : address ? (
                <span className="text-white">{address}</span>
              ) : (
                <span className="text-slate-500">No location selected</span>
              )}
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLocation}
                disabled={!coords || !address || loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 text-white text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
