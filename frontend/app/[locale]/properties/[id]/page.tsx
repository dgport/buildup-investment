"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Copy,
  Check,
  MapPin,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/lib/hooks/useProperties";
import { useCurrency } from "@/lib/currency";
import { useTranslations, useLocale } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { ConditionUtilitiesSection } from "../_components/ConditionUtilitesSection";
import { AmenitiesFeaturesSection } from "../_components/AmenitiesFeatureSection";
import { PropertyDetailsSection } from "../_components/PropertyDetailsSection";
import MapboxMap from "../_components/MapBox";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
  "http://localhost:3000";

function resolveImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${API_BASE}/${imageUrl.replace(/^\/+/, "")}`;
}

function formatEnumValue(value: string | null): string {
  if (!value) return "";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseCoords(location: string | null) {
  if (!location) return null;
  const [lat, lng] = location.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs sm:text-sm font-medium text-gray-500">
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("properties");
  const locale = useLocale();
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: property, isLoading, error } = useProperty(id, locale);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleThumbClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi || !thumbsApi) return;
    const onSelect = () => {
      const i = emblaApi.selectedScrollSnap();
      setSelectedIndex(i);
      thumbsApi.scrollTo(i);
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, thumbsApi]);

  const formatPrice = (priceUSD: number | null) => {
    if (!priceUSD) return t("priceOnRequest");
    return currency === "USD"
      ? `$${priceUSD.toLocaleString()}`
      : `₾${Math.round(priceUSD * exchangeRate).toLocaleString()}`;
  };

  const handleCopyId = async () => {
    const val = property?.externalId ?? property?.id;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(String(val));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // clipboard write failed silently
    }
  };

  const handleCopyPhone = async () => {
    if (!property?.contactPhone) return;
    try {
      await navigator.clipboard.writeText(property.contactPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // clipboard write failed silently
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  const images =
    property.galleryImages?.map((img) => resolveImageUrl(img.imageUrl)) ?? [];
  const coordinates = parseCoords(property.location);
  const locationString =
    [property.translation?.address ?? property.address, property.regionName]
      .filter(Boolean)
      .join(", ") || t("noLocation");

  const phoneClean = property.contactPhone?.replace(/[^\d]/g, "") ?? "";
  const whatsappMsg = encodeURIComponent(
    t("whatsappMessage", {
      title: property.translation?.title ?? t("noTitle"),
      id: property.externalId ?? property.id,
    }),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Carousel + Info card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Carousel */}
          <div className="lg:col-span-2 h-[350px] lg:h-[500px]">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full relative">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.length > 0 ? (
                    images.map((img, i) => (
                      <div key={i} className="relative flex-[0_0_100%] h-full">
                        <img
                          src={img}
                          alt={property.translation?.title ?? t("noTitle")}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => {
                            setLightboxIndex(selectedIndex);
                            setLightboxOpen(true);
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400">{t("noImage")}</p>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 z-20 px-4">
                    <div className="bg-black/10 rounded-xl p-3">
                      <div className="overflow-hidden" ref={thumbsRef}>
                        <div className="flex gap-2">
                          {images.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => handleThumbClick(i)}
                              style={{ width: 64, height: 48 }}
                              className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all border-4 ${
                                i === selectedIndex
                                  ? "border-blue-600 scale-105 shadow-xl"
                                  : "border-white/50 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${t("thumb")} ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-5 h-auto lg:h-[500px] flex flex-col justify-between">
              <div className="space-y-1">
                <InfoRow label={t("detailPropertyId")}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {property.externalId ?? property.id}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={copiedId ? t("copied") : t("copyId")}
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </InfoRow>
                <InfoRow label={t("detailRegion")}>
                  <span className="text-base font-bold">
                    {property.regionName ?? "—"}
                  </span>
                </InfoRow>
                <InfoRow label={t("detailPrice")}>
                  <span className="text-base font-bold">
                    {formatPrice(property.price)}
                  </span>
                </InfoRow>
                <InfoRow label={t("detailCurrency")}>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2.5 py-1.5">
                    <span
                      className={`text-xs font-medium ${currency === "USD" ? "text-blue-900" : "text-gray-400"}`}
                    >
                      USD
                    </span>
                    <Switch
                      checked={currency === "GEL"}
                      onCheckedChange={(c) => setCurrency(c ? "GEL" : "USD")}
                    />
                    <span
                      className={`text-xs font-medium ${currency === "GEL" ? "text-blue-900" : "text-gray-400"}`}
                    >
                      GEL
                    </span>
                  </div>
                </InfoRow>
                <InfoRow label={t("detailPropertyType")}>
                  <span className="text-sm font-semibold text-blue-900">
                    {formatEnumValue(property.propertyType)}
                  </span>
                </InfoRow>
                <InfoRow label={t("detailListedOn")}>
                  <span className="text-sm font-semibold">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </InfoRow>
              </div>

              {property.contactPhone && (
                <div className="space-y-2 pt-3">
                  <div className="relative">
                    <Button
                      size="lg"
                      onClick={() =>
                        (window.location.href = `tel:${phoneClean}`)
                      }
                      className="w-full bg-blue-900 hover:bg-blue-800 h-11 pr-12"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {property.contactPhone}
                    </Button>
                    <button
                      onClick={handleCopyPhone}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-800 rounded"
                      title={copiedPhone ? t("copied") : t("copyPhone")}
                    >
                      {copiedPhone ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${phoneClean}?text=${whatsappMsg}`,
                        "_blank",
                      )
                    }
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 h-11 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("contactWhatsApp")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {property.translation?.title ?? t("noTitle")}
            </h1>
            <div className="h-px w-full bg-gray-200 my-4" />
            {property.translation?.description ? (
              <p className="text-gray-700 whitespace-pre-line">
                {property.translation.description}
              </p>
            ) : (
              <p className="text-gray-400 italic">{t("noDescription")}</p>
            )}
          </div>

          <PropertyDetailsSection property={property} />

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {t("location")}
            </h3>
            <p className="text-gray-700">{locationString}</p>
          </div>

          <ConditionUtilitiesSection property={property} />
          <AmenitiesFeaturesSection property={property} />

          {coordinates && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="h-[300px] sm:h-[350px] rounded-xl overflow-hidden">
                <MapboxMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((src) => ({ src }))}
        index={lightboxIndex}
      />
    </div>
  );
}
