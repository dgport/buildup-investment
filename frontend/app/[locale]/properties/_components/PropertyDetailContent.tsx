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
  Building2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/lib/hooks/useProperties";
import { useCurrency } from "@/lib/currency";
import { useTranslations, useLocale } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { ConditionUtilitiesSection } from "./ConditionUtilitesSection";
import { AmenitiesFeaturesSection } from "./AmenitiesFeatureSection";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import MapboxMap from "./MapBox";

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
    <div className="flex items-center justify-between py-2.5 border-b border-teal-50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export function PropertyDetailContent() {
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
    } catch {}
  };

  const handleCopyPhone = async () => {
    if (!property?.contactPhone) return;
    try {
      await navigator.clipboard.writeText(property.contactPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-900 rounded-xl p-2">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-teal-950 truncate">
            {property.translation?.title ?? t("noTitle")}
          </h1>
        </div>

        {/* Carousel + Info card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Carousel */}
          <div className="lg:col-span-2 h-[350px] lg:h-[500px]">
            <div className="bg-white rounded-2xl overflow-hidden border border-teal-100 h-full relative">
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
                    <div className="w-full h-full bg-teal-50 flex items-center justify-center">
                      <p className="text-teal-400">{t("noImage")}</p>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md z-20 transition-colors border border-teal-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-teal-900" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md z-20 transition-colors border border-teal-100"
                  >
                    <ChevronRight className="w-5 h-5 text-teal-900" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 z-20 px-4">
                    <div className="bg-teal-950/60 backdrop-blur-sm rounded-xl p-2.5">
                      <div className="overflow-hidden" ref={thumbsRef}>
                        <div className="flex gap-2">
                          {images.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => handleThumbClick(i)}
                              style={{ width: 64, height: 48 }}
                              className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${
                                i === selectedIndex
                                  ? "border-amber-400 scale-105"
                                  : "border-transparent opacity-60 hover:opacity-100"
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
            <div className="bg-white rounded-2xl border border-teal-100 p-5 h-auto lg:h-[500px] flex flex-col justify-between">
              {/* Header strip */}
              <div>
                <div className="bg-teal-950 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                    {formatEnumValue(property.propertyType)}
                  </span>
                  <span className="text-amber-400 font-bold text-base">
                    {formatPrice(property.price)}
                  </span>
                </div>

                <div className="space-y-0">
                  <InfoRow label={t("detailPropertyId")}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-teal-900">
                        {property.externalId ?? property.id}
                      </span>
                      <button
                        onClick={handleCopyId}
                        className="p-1 hover:bg-teal-50 rounded transition-colors"
                        title={copiedId ? t("copied") : t("copyId")}
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-teal-400" />
                        )}
                      </button>
                    </div>
                  </InfoRow>

                  <InfoRow label={t("detailRegion")}>
                    <span className="text-sm font-bold text-teal-950">
                      {property.regionName ?? "—"}
                    </span>
                  </InfoRow>

                  <InfoRow label={t("detailCurrency")}>
                    <div className="flex items-center gap-2 bg-teal-50 rounded-full px-3 py-1.5">
                      <span
                        className={`text-xs font-semibold ${currency === "USD" ? "text-teal-900" : "text-teal-400"}`}
                      >
                        USD
                      </span>
                      <Switch
                        checked={currency === "GEL"}
                        onCheckedChange={(c) => setCurrency(c ? "GEL" : "USD")}
                      />
                      <span
                        className={`text-xs font-semibold ${currency === "GEL" ? "text-teal-900" : "text-teal-400"}`}
                      >
                        GEL
                      </span>
                    </div>
                  </InfoRow>

                  <InfoRow label={t("detailListedOn")}>
                    <span className="text-sm font-semibold text-teal-950">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </InfoRow>
                </div>
              </div>

              {/* Contact buttons */}
              {property.contactPhone && (
                <div className="space-y-2 pt-3 border-t border-teal-50">
                  <div className="relative">
                    <Button
                      size="lg"
                      onClick={() =>
                        (window.location.href = `tel:${phoneClean}`)
                      }
                      className="w-full bg-teal-900 hover:bg-teal-800 h-11 pr-12 font-semibold"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {property.contactPhone}
                    </Button>
                    <button
                      onClick={handleCopyPhone}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-teal-800 rounded transition-colors"
                      title={copiedPhone ? t("copied") : t("copyPhone")}
                    >
                      {copiedPhone ? (
                        <Check className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/70" />
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
                    className="w-full border-2 border-teal-200 text-teal-800 hover:bg-teal-50 hover:border-teal-400 h-11 bg-transparent font-semibold"
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
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-teal-100">
            <div className="h-px w-full bg-teal-50 my-4" />
            {property.translation?.description ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {property.translation.description}
              </p>
            ) : (
              <p className="text-teal-400 italic">{t("noDescription")}</p>
            )}
          </div>

          <PropertyDetailsSection property={property} />

          <div className="bg-white rounded-2xl p-6 border border-teal-100">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("location")}
            </h3>
            <p className="text-teal-950 font-medium">{locationString}</p>
          </div>

          <ConditionUtilitiesSection property={property} />
          <AmenitiesFeaturesSection property={property} />

          {coordinates && (
            <div className="bg-white rounded-2xl border border-teal-100 p-4">
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
