"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { MapboxMapProps } from "@/app/[locale]/properties/_components/MapBox";

const PropertyMap = dynamic(() => import("@/app/[locale]/properties/_components/MapBox"), { ssr: false });

/** Defer the map engine and tiles until the map approaches the viewport. */
export function LazyPropertyMap(props: MapboxMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const t = useTranslations("common.actions");
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className="h-full w-full bg-teal-50">
    {visible ? <PropertyMap {...props} /> : <div className="flex h-full items-center justify-center text-sm text-teal-700">{t("loading")}</div>}
  </div>;
}
