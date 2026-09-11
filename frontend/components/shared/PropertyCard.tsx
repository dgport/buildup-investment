"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  DoorOpen,
  Flame,
  ImageIcon,
  MapPin,
  Ruler,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { ROUTES } from "@/lib/constants/routes";
import type { Property } from "@/lib/types/properties";

interface PropertyCardProps {
  property: Property;
}

/**
 * Listing card: framed photo with price pill, then title, location, specs and
 * a dashed footer with date + ID. Currency comes from the global toggle.
 */
const PropertyCard = ({ property }: PropertyCardProps) => {
  const t = useTranslations("properties");
  const locale = useLocale();
  const { currency, exchangeRate } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [index, setIndex] = useState(0);

  const title = property.translation?.title || t("noTitle");
  const images = (property.galleryImages ?? [])
    .map((img) => resolveImageUrl(img.imageUrl))
    .filter((src): src is string => !!src);
  const many = images.length > 1;

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const copyId = async (e: React.MouseEvent) => {
    stop(e);
    try {
      await navigator.clipboard.writeText(property.externalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const price = property.price
    ? currency === "USD"
      ? `$${property.price.toLocaleString()}`
      : `${Math.round(property.price * exchangeRate).toLocaleString()} ₾`
    : t("priceOnRequest");

  const date = new Date(property.createdAt).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-GB", {
    day: "2-digit",
    month: "short",
  });

  const location = [property.regionName, property.translation?.address ?? property.address]
    .filter(Boolean)
    .join(", ");

  const specs = [
    property.rooms ? { icon: DoorOpen, value: `${property.rooms} ${t("rooms")}` } : null,
    property.bedrooms ? { icon: BedDouble, value: `${property.bedrooms} ${t("bedrooms")}` } : null,
    property.totalArea ? { icon: Ruler, value: `${property.totalArea} m²` } : null,
  ].filter((s): s is { icon: typeof DoorOpen; value: string } => !!s);

  return (
    <Link href={ROUTES.PROPERTY(property.id)} className="group block h-full">
      <article className="h-full flex flex-col rounded-[22px] bg-white p-2.5 border border-teal-950/[0.07] shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover">
        {/* Photo */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
          {images.length > 0 ? (
            images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${title} – ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
              <ImageIcon className="w-7 h-7" />
              <span className="text-xs">{t("noImage")}</span>
            </div>
          )}

          {many && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  setIndex((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-teal-950 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  setIndex((i) => (i + 1) % images.length);
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-teal-950 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                {images.slice(0, 6).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-amber-400" : "w-1.5 bg-white/70"}`}
                  />
                ))}
              </div>
            </>
          )}

          <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 text-teal-950 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 shadow-sm">
            {t(`enums.dealType.${property.dealType}`)}
          </span>
          {property.hotSale && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-amber-400 text-teal-950 text-[11px] font-black uppercase tracking-wide px-2.5 py-1 shadow">
              <Flame className="w-3 h-3" />
              {t("hotSale")}
            </span>
          )}
          <span className="absolute bottom-2.5 left-2.5 rounded-xl bg-teal-950/90 backdrop-blur text-white font-bold text-base px-3 py-1.5 shadow-lg">
            {price}
          </span>
        </div>

        {/* Body */}
        <div className="px-2 pt-3.5 pb-1.5 flex flex-col flex-1">
          <h3 className="font-semibold text-teal-950 leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500 min-h-5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">
              {t(`enums.propertyType.${property.propertyType}`)}
              {location ? ` · ${location}` : ""}
            </span>
          </p>

          <div className="mt-3 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-teal-900 min-h-5">
            {specs.map(({ icon: Icon, value }) => (
              <span key={value} className="inline-flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-teal-600" />
                {value}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-dashed border-teal-900/15 flex items-center justify-between text-[11px] text-slate-400">
            <span>{date}</span>
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-slate-100 hover:text-teal-800 transition"
              title={copied ? t("copied") : t("copyId")}
            >
              ID {property.externalId}
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;
