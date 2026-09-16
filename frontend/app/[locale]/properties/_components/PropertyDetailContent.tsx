"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  DoorOpen,
  FileText,
  Flame,
  Hash,
  ImageIcon,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Phone,
  Layers,
  Ruler,
  Share2,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { useProperty } from "@/lib/hooks/useProperties";
import { formatMoney, useCurrency } from "@/lib/currency";
import { useTranslations, useLocale } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { DetailSkeleton } from "@/components/shared/Skeletons";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { SimilarProperties } from "./SimilarProperties";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";
import { DetailSection } from "./DetailSection";

import { ConditionUtilitiesSection } from "./ConditionUtilitesSection";
import { AmenitiesFeaturesSection } from "./AmenitiesFeatureSection";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import MapboxMap from "./MapBox";
import { parseLocation } from "./form/PropertyFormSections";

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-dashed border-teal-900/10 last:border-0">
      <span className="flex items-center gap-2 text-[13px] font-medium text-slate-500 shrink-0">
        <Icon className="w-3.5 h-3.5 text-teal-600" />
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
  const tc = useTranslations("common");
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

  const formatPrice = (priceUSD: number | null) =>
    formatMoney(priceUSD, currency, exchangeRate) ?? t("priceOnRequest");

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

  /** The four numbers a buyer scans first, shown as a strip under the gallery. */
  const keyFacts = [
    property.totalArea
      ? { icon: Ruler, label: t("fields.totalArea"), value: `${property.totalArea} m²` }
      : null,
    property.rooms ? { icon: DoorOpen, label: t("fields.rooms"), value: String(property.rooms) } : null,
    property.bedrooms
      ? { icon: BedDouble, label: t("fields.bedrooms"), value: String(property.bedrooms) }
      : null,
    property.floors != null
      ? {
          icon: Layers,
          label: t("fields.floor"),
          value: property.floorsTotal ? `${property.floors} / ${property.floorsTotal}` : String(property.floors),
        }
      : null,
  ].filter((f): f is { icon: LucideIcon; label: string; value: string } => !!f);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Link href={ROUTES.HOME} className="hover:text-teal-800">{tc("nav.home")}</Link>
            <span className="text-slate-300">/</span>
            <Link href={ROUTES.PROPERTIES} className="hover:text-teal-800">{tc("nav.properties")}</Link>
            <span className="text-slate-300">/</span>
            <span className="text-teal-900 font-medium truncate">{title}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-900 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  {t(`enums.propertyType.${property.propertyType}`)}
                </span>
                <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-100 text-[11px] font-bold uppercase tracking-wide px-3 py-1">
                  {t(`enums.dealType.${property.dealType}`)}
                </span>
                {property.hotSale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-teal-950 text-[11px] font-black uppercase tracking-wide px-3 py-1">
                    <Flame className="w-3.5 h-3.5" />
                    {t("hotSale")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-950 leading-tight">{title}</h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                {locationString}
              </p>
            </div>

            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-amber-600 border border-teal-200 hover:border-amber-300 rounded-xl px-3.5 h-10 bg-white shrink-0 transition-colors"
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
                <div className="relative overflow-hidden bg-teal-950 rounded-2xl px-4 py-4 mb-4">
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(245,158,11,0.22), transparent 60%)",
                    }}
                  />
                  <div className="relative">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                      {t(`enums.dealType.${property.dealType}`)}
                    </p>
                    <p className="text-white font-bold text-3xl tracking-tight tabular-nums mt-0.5">
                      {formatPrice(property.price)}
                    </p>
                    {property.price != null && property.totalArea ? (
                      <p className="text-teal-100/60 text-xs mt-1">
                        {formatPrice(Math.round(property.price / property.totalArea))} / m²
                      </p>
                    ) : null}

                    <div className="mt-3 inline-flex rounded-lg bg-white/10 p-0.5 gap-0.5">
                      {(["GEL", "USD"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          aria-pressed={currency === c}
                          className={`px-2.5 h-7 rounded-md text-[11px] font-bold tracking-wide transition ${
                            currency === c ? "bg-amber-400 text-teal-950" : "text-white/60 hover:text-white"
                          }`}
                        >
                          {c === "GEL" ? "₾ GEL" : "$ USD"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-0">
                  <InfoRow icon={Hash} label={t("detailPropertyId")}>
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

                  <InfoRow icon={Building2} label={t("detailPropertyType")}>
                    <span className="text-sm font-bold text-teal-950">
                      {t(`enums.propertyType.${property.propertyType}`)}
                    </span>
                  </InfoRow>

                  <InfoRow icon={MapPin} label={t("detailRegion")}>
                    <span className="text-sm font-bold text-teal-950">
                      {property.regionName ?? "—"}
                    </span>
                  </InfoRow>

                  <InfoRow icon={CalendarDays} label={t("detailListedOn")}>
                    <span className="text-sm font-semibold text-teal-950">
                      {formatDate(property.createdAt, locale)}
                    </span>
                  </InfoRow>

                  {ownerName && (
                    <InfoRow icon={User} label={t("listedBy")}>
                      <span className="text-sm font-semibold text-teal-950">{ownerName}</span>
                    </InfoRow>
                  )}
                </div>
              </div>

              {!property.contactPhone && (
                <div className="pt-3 border-t border-teal-50">
                  <Button size="lg" asChild className="w-full bg-teal-900 hover:bg-teal-800 h-11 font-semibold">
                    <Link href={ROUTES.CONTACT}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("contactUs")}
                    </Link>
                  </Button>
                </div>
              )}

              {property.contactPhone && (
                <div className="space-y-2 pt-3 border-t border-teal-50">
                  <p className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span>{t("agencyContact")}</span>
                    <span className="normal-case tracking-normal font-medium text-slate-400">
                      {t("callHint", { id: property.externalId ?? property.id })}
                    </span>
                  </p>
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

        {keyFacts.length > 0 && (
          <div className="card mb-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-teal-900/[0.07] overflow-hidden">
            {keyFacts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-4">
                <span className="rounded-xl bg-teal-50 text-teal-800 p-2.5 shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 truncate">{label}</p>
                  <p className="text-lg font-bold text-teal-950 tabular-nums truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <DetailSection icon={FileText} title={t("descriptionTitle")}>
            {property.translation?.description ? (
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {property.translation.description}
              </p>
            ) : (
              <p className="text-slate-400 italic">{t("noDescription")}</p>
            )}
          </DetailSection>

          <PropertyDetailsSection property={property} />

          <DetailSection icon={MapPin} title={t("location")} accent="amber">
            <p className="text-teal-950 font-medium">{locationString}</p>
          </DetailSection>

          <ConditionUtilitiesSection property={property} />
          <AmenitiesFeaturesSection property={property} />

          {coordinates && (
            <DetailSection icon={MapIcon} title={t("mapTitle")} accent="violet">
              <div className="h-[300px] sm:h-[380px] rounded-xl overflow-hidden ring-1 ring-teal-900/10">
                <MapboxMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  labels={{ view2d: t("view2d"), view3d: t("view3d") }}
                />
              </div>
            </DetailSection>
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
