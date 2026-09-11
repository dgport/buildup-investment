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
  Flame,
  User,
  ImageIcon,
  Share2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/lib/hooks/useProperties";
import { useCurrency } from "@/lib/currency";
import { useTranslations, useLocale } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { DetailSkeleton } from "@/components/shared/Skeletons";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SimilarProperties } from "./SimilarProperties";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";

import { ConditionUtilitiesSection } from "./ConditionUtilitesSection";
import { AmenitiesFeaturesSection } from "./AmenitiesFeatureSection";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import MapboxMap from "./MapBox";
import { parseLocation } from "./form/PropertyFormSections";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-teal-50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-teal-600 shrink-0">
        {label}
      </span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

export function PropertyDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const t = useTranslations("properties");
  const locale = useLocale();
  const { currency, setCurrency, exchangeRate } = useCurrency();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shared, setShared] = useState(false);

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
      : `${Math.round(priceUSD * exchangeRate).toLocaleString()} ₾`;
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        toast.success(t("linkCopied"));
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  const copy = async (value: string, done: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      done(true);
      setTimeout(() => done(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <DetailSkeleton />
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

  const title = property.translation?.title || t("noTitle");
  const images = (property.galleryImages ?? [])
    .map((img) => resolveImageUrl(img.imageUrl))
    .filter((src): src is string => !!src);
  const coordinates = parseLocation(property.location);
  const locationString =
    [property.translation?.address ?? property.address, property.regionName]
      .filter(Boolean)
      .join(", ") || t("noLocation");

  const phoneClean = property.contactPhone?.replace(/[^\d+]/g, "") ?? "";
  const whatsappNumber = phoneClean.replace(/^\+/, "");
  const whatsappMsg = encodeURIComponent(
    t("whatsappMessage", { title, id: property.externalId ?? property.id }),
  );
  const ownerName = property.user
    ? `${property.user.firstname} ${property.user.lastname}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-900 rounded-xl p-2 shrink-0">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-teal-950 truncate">
              {title}
            </h1>
            <p className="text-sm text-teal-700/70">
              {t(`enums.propertyType.${property.propertyType}`)} ·{" "}
              {t(`enums.dealType.${property.dealType}`)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {property.hotSale && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg px-3 py-1.5 shadow flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wide">
                <Flame className="w-4 h-4" />
                {t("hotSale")}
              </span>
            )}
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 text-sm text-teal-800 hover:text-amber-600 border border-teal-200 rounded-xl px-3 py-2 bg-white"
            >
              {shared ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{shared ? t("linkCopied") : t("share")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Carousel */}
          <div className="lg:col-span-2 h-[350px] lg:h-[500px]">
            <div className="card overflow-hidden h-full relative">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.length > 0 ? (
                    images.map((img, i) => (
                      <div key={img} className="relative flex-[0_0_100%] h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`${title} ${i + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => {
                            setLightboxIndex(selectedIndex);
                            setLightboxOpen(true);
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-teal-50 flex flex-col items-center justify-center gap-2 text-teal-400">
                      <ImageIcon className="w-10 h-10" />
                      <p>{t("noImage")}</p>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md z-20 transition-colors border border-teal-100"
                  >
                    <ChevronLeft className="w-5 h-5 text-teal-900" />
                  </button>
                  <button
                    onClick={scrollNext}
                    aria-label="Next"
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
                              key={img}
                              onClick={() => handleThumbClick(i)}
                              style={{ width: 64, height: 48 }}
                              className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all border-2 ${
                                i === selectedIndex
                                  ? "border-amber-400 scale-105"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <div className="card p-5 h-auto lg:h-[500px] flex flex-col justify-between lg:sticky lg:top-28">
              <div>
                <div className="bg-teal-950 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                    {t(`enums.dealType.${property.dealType}`)}
                  </span>
                  <span className="text-amber-400 font-bold text-lg">
                    {formatPrice(property.price)}
                  </span>
                </div>

                <div className="space-y-0">
                  <InfoRow label={t("detailPropertyId")}>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-mono text-sm text-teal-900">
                        {property.externalId ?? property.id}
                      </span>
                      <button
                        onClick={() =>
                          copy(String(property.externalId ?? property.id), setCopiedId)
                        }
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

                  <InfoRow label={t("detailPropertyType")}>
                    <span className="text-sm font-bold text-teal-950">
                      {t(`enums.propertyType.${property.propertyType}`)}
                    </span>
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
                        aria-label="USD / GEL"
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
                      {formatDate(property.createdAt, locale)}
                    </span>
                  </InfoRow>

                  {ownerName && (
                    <InfoRow label={t("listedBy")}>
                      <span className="text-sm font-semibold text-teal-950 flex items-center gap-1.5 justify-end">
                        <User className="w-3.5 h-3.5 text-teal-500" />
                        {ownerName}
                      </span>
                    </InfoRow>
                  )}
                </div>
              </div>

              {property.contactPhone && (
                <div className="space-y-2 pt-3 border-t border-teal-50">
                  <div className="relative">
                    <Button
                      size="lg"
                      asChild
                      className="w-full bg-teal-900 hover:bg-teal-800 h-11 pr-12 font-semibold"
                    >
                      <a href={`tel:${phoneClean}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        {property.contactPhone}
                      </a>
                    </Button>
                    <button
                      onClick={() => copy(property.contactPhone!, setCopiedPhone)}
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
                    asChild
                    className="w-full border-2 border-teal-200 text-teal-800 hover:bg-teal-50 hover:border-teal-400 h-11 bg-transparent font-semibold"
                  >
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("contactWhatsApp")}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">
              {t("descriptionTitle")}
            </h3>
            {property.translation?.description ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {property.translation.description}
              </p>
            ) : (
              <p className="text-teal-400 italic">{t("noDescription")}</p>
            )}
          </div>

          <PropertyDetailsSection property={property} />

          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("location")}
            </h3>
            <p className="text-teal-950 font-medium">{locationString}</p>
          </div>

          <ConditionUtilitiesSection property={property} />
          <AmenitiesFeaturesSection property={property} />

          {coordinates && (
            <div className="card p-4">
              <div className="h-[300px] sm:h-[350px] rounded-xl overflow-hidden">
                <MapboxMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  labels={{ view2d: t("view2d"), view3d: t("view3d") }}
                />
              </div>
            </div>
          )}

          <SimilarProperties property={property} />
        </div>
      </div>

      <MobileContactBar
        phone={property.contactPhone}
        whatsappText={t("whatsappMessage", { title, id: property.externalId ?? property.id })}
        callLabel={t("call")}
        whatsappLabel={t("contactWhatsApp")}
      />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={images.map((src) => ({ src }))}
        index={lightboxIndex}
      />
    </div>
  );
}
