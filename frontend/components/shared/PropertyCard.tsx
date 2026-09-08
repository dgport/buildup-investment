"use client";

import {
  Calendar,
  MapPin,
  Square,
  Sofa,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTranslations, useLocale } from "next-intl";
import { useCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { ROUTES } from "@/lib/constants/routes";
import type { Property } from "@/lib/types/properties";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const t = useTranslations("properties");
  const locale = useLocale();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const title = property.translation?.title || t("noTitle");
  const allImages = (property.galleryImages ?? [])
    .map((img) => resolveImageUrl(img.imageUrl))
    .filter((src): src is string => !!src);
  const hasMultipleImages = allImages.length > 1;
  const href = ROUTES.PROPERTY(property.id);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleCopyId = async (e: React.MouseEvent) => {
    stop(e);
    try {
      await navigator.clipboard.writeText(property.externalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const goToPrevious = (e: React.MouseEvent) => {
    stop(e);
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    stop(e);
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatPrice = (priceUSD: number | null) => {
    if (!priceUSD) return t("priceOnRequest");
    return currency === "USD"
      ? `$${priceUSD.toLocaleString()}`
      : `${Math.round(priceUSD * exchangeRate).toLocaleString()} ₾`;
  };

  return (
    <Link
      href={href}
      className="card card-hover block h-full w-full cursor-pointer overflow-hidden"
    >
      <div className="relative h-60 overflow-hidden bg-gray-100 border-b border-teal-900/10">
        {allImages.length > 0 ? (
          <div className="relative h-full bg-gray-900">
            {allImages.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${title} - ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-400/90 hover:bg-amber-400 rounded-full p-2 shadow-lg transition-all z-10 border border-amber-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-teal-950" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-400/90 hover:bg-amber-400 rounded-full p-2 shadow-lg transition-all z-10 border border-amber-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-teal-950" />
                </button>
                <div className="absolute top-2 left-2 bg-teal-950/80 backdrop-blur-sm text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full z-10 border border-amber-400/30">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-sm">{t("noImage")}</p>
          </div>
        )}

        {property.hotSale && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-20 border border-red-600">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {t("hotSale")}
            </span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-teal-950/90 backdrop-blur-sm text-amber-100 text-[11px] font-semibold px-2.5 py-1 rounded-lg z-20 border border-amber-400/30 uppercase tracking-wide">
          {t(`enums.dealType.${property.dealType}`)}
        </div>

        <div
          className="absolute bottom-2 right-2 bg-teal-950/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md flex items-center gap-1.5 z-20 border border-amber-400/30"
          onClick={stop}
        >
          <span className="text-xs text-amber-400 font-semibold">
            ID: {property.externalId}
          </span>
          <button
            onClick={handleCopyId}
            className="text-amber-400 hover:text-amber-300 transition-colors p-0.5"
            title={copied ? t("copied") : t("copyId")}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="pb-3 border-b-2 border-amber-400/20 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-teal-950 truncate">
                {formatPrice(property.price)}
              </h3>
              <div
                className="flex items-center gap-1.5 shrink-0"
                onClick={stop}
              >
                <span className="text-xs font-medium text-teal-800">$</span>
                <Switch
                  checked={currency === "GEL"}
                  onCheckedChange={(checked) =>
                    setCurrency(checked ? "GEL" : "USD")
                  }
                  aria-label="USD / GEL"
                />
                <span className="text-xs font-medium text-teal-800">₾</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-teal-700/80 text-xs whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(property.createdAt)}</span>
            </div>
          </div>

          <h4 className="text-sm sm:text-base text-teal-900 hover:text-amber-600 transition-colors line-clamp-1 font-semibold">
            {title}
          </h4>

          <div className="flex items-start gap-2 text-teal-800 text-sm pb-3 border-b border-teal-900/10">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <span className="line-clamp-1">
              {[t(`enums.propertyType.${property.propertyType}`), property.regionName]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1 min-h-[24px]">
            {!!property.rooms && property.rooms > 0 && (
              <div className="flex items-center gap-1.5 text-teal-800">
                <Sofa className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">
                  {t("rooms")}: {property.rooms}
                </span>
              </div>
            )}
            {!!property.totalArea && (
              <div className="flex items-center gap-1.5 text-teal-800">
                <Square className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">
                  {t("area")}: {property.totalArea} m²
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
