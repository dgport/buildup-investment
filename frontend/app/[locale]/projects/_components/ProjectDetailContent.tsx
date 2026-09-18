"use client";

import { DemoNotice } from "@/components/shared/DemoNotice";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  Building2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  ImageIcon,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProject } from "@/lib/hooks/useProjects";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { DetailSkeleton } from "@/components/shared/Skeletons";
import { MobileContactBar } from "@/components/shared/MobileContactBar";
import { toEmbedUrl } from "@/lib/utils/format";
import { formatMoney, useCurrency } from "@/lib/currency";
import { ROUTES } from "@/lib/constants/routes";
import type { UnitType } from "@/lib/types/projects";
import MapboxMap from "@/app/[locale]/properties/_components/MapBox";
import { parseLocation } from "@/app/[locale]/properties/_components/form/PropertyFormSections";
import ProjectCard from "@/components/shared/ProjectCard";
import { UnitTypeCard } from "./UnitTypeCard";
import { LeadForm } from "./LeadForm";

const STATUS_STYLES: Record<string, string> = {
  PLANNED: "bg-sky-100 text-sky-800 border-sky-200",
  UNDER_CONSTRUCTION: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-teal-50 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-teal-600 shrink-0">{label}</span>
      <div className="text-right text-sm font-semibold text-teal-950 min-w-0">{children}</div>
    </div>
  );
}

export function ProjectDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslations("projects");
  const locale = useLocale();
  const { currency, exchangeRate } = useCurrency();
  const money = (usd: number | null | undefined) => formatMoney(usd, currency, exchangeRate) ?? "";
  const { data: project, isLoading, error } = useProject(slug, locale);

  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadUnit, setLeadUnit] = useState<UnitType | null>(null);
  const [copied, setCopied] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !thumbsApi) return;
    const onSelect = () => {
      const i = emblaApi.selectedScrollSnap();
      setSelected(i);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <DetailSkeleton />
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  const title = project.title ?? project.slug;
  const images = project.images.map((i) => resolveImageUrl(i.imageUrl)).filter((s): s is string => !!s);
  const logo = resolveImageUrl(project.developer.logo);
  const coords = parseLocation(project.location);
  const phone = project.developer.phone;
  const phoneClean = phone?.replace(/[^\d+]/g, "") ?? "";
  const whatsapp = phoneClean.replace(/^\+/, "");
  const embed = toEmbedUrl(project.videoUrl);
  const delivery =
    project.deliveryYear &&
    (project.deliveryQuarter
      ? t("quarter", { q: project.deliveryQuarter, year: project.deliveryYear })
      : String(project.deliveryYear));

  const openLead = (unit: UnitType | null) => {
    setLeadUnit(unit);
    setLeadOpen(true);
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Heading */}
        <div className="flex flex-wrap items-start gap-4 mb-6">
          <div className="bg-teal-900 rounded-xl p-2 shrink-0">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-950">{title}</h1>
              {project.isDemo && <DemoNotice />}
              <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[project.status]}`}>
                {t(`status.${project.status}`)}
              </span>
              {project.hotSale && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <Flame className="w-3 h-3" /> {t("hotSale")}
                </span>
              )}
            </div>
            <p className="text-sm text-teal-700/80 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {[project.address, project.regionName].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={share}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm text-teal-800 hover:text-amber-600 border border-teal-200 rounded-xl px-3 py-2 bg-white"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? t("detail.copied") : t("detail.share")}
          </button>
        </div>

        {/* Gallery + info card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 h-[340px] lg:h-[520px]">
            <div className="card overflow-hidden h-full relative">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.length ? (
                    images.map((img, i) => (
                      <div key={img} className="relative flex-[0_0_100%] h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`${title} ${i + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setLightbox({ images, index: selected })}
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
                  <button onClick={scrollPrev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md z-20 border border-teal-100">
                    <ChevronLeft className="w-5 h-5 text-teal-900" />
                  </button>
                  <button onClick={scrollNext} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md z-20 border border-teal-100">
                    <ChevronRight className="w-5 h-5 text-teal-900" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 z-20 px-4">
                    <div className="bg-teal-950/60 backdrop-blur-sm rounded-xl p-2.5">
                      <div className="overflow-hidden" ref={thumbsRef}>
                        <div className="flex gap-2">
                          {images.map((img, i) => (
                            <div
                              key={img}
                              onClick={() => { setSelected(i); emblaApi?.scrollTo(i); }}
                              style={{ width: 64, height: 48 }}
                              className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                i === selected ? "border-amber-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
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

          <div className="card p-5 flex flex-col gap-4 lg:sticky lg:top-28 self-start">
            <div className="bg-teal-950 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-teal-300">{t("detail.pricePerSqm")}</p>
                <p className="text-amber-400 font-bold text-xl leading-tight">
                  {project.pricePerSqmFrom ? t("priceFromSqm", { price: money(project.pricePerSqmFrom) }) : t("priceOnRequest")}
                </p>
              </div>
              {project.priceFrom ? (
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-teal-300">{t("detail.priceFrom")}</p>
                  <p className="text-white font-bold">{t("priceFrom", { price: money(project.priceFrom) })}</p>
                </div>
              ) : null}
            </div>

            <div>
              <Row label={t("detail.developer")}>
                <Link href={ROUTES.DEVELOPER(project.developer.slug)} className="inline-flex items-center gap-2 hover:text-amber-600">
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="w-7 h-7 rounded-md object-contain bg-white border border-teal-100 p-0.5" />
                  )}
                  <span className="truncate">{project.developer.name}</span>
                </Link>
              </Row>
              <Row label={t("detail.region")}>{project.regionName ?? "—"}</Row>
              {delivery && (
                <Row label={t("detail.delivery")}>
                  <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5 text-amber-500" />{delivery}</span>
                </Row>
              )}
              {project.floors ? (
                <Row label={t("detail.floors")}><span className="inline-flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-amber-500" />{project.floors}</span></Row>
              ) : null}
              {project.totalApartments ? <Row label={t("detail.apartments")}>{project.totalApartments}</Row> : null}
              {project.progress != null && (
                <div className="py-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wide text-teal-600">{t("detail.progress")}</span>
                    <span className="font-bold text-teal-950">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-600 to-amber-400 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-2 pt-3 border-t border-teal-50">
              <Button onClick={() => openLead(null)} className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("detail.requestConsultation")}
              </Button>
              {phone && (
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="h-11 border-2 border-teal-200 text-teal-900 font-semibold">
                    <a href={`tel:${phoneClean}`}><Phone className="w-4 h-4 mr-2" />{t("detail.call")}</a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 border-2 border-teal-200 text-teal-900 font-semibold">
                    <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`${title} · buildup.ge`)}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />{t("detail.whatsapp")}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Description */}
          <section className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">{t("detail.description")}</h2>
            {project.description ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{project.description}</p>
            ) : (
              <p className="text-teal-400 italic">—</p>
            )}
          </section>

          {/* Amenities + payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.amenities.length > 0 && (
              <section className="card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">{t("detail.amenities")}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {project.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-teal-900">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      {t(`amenities.${a}` as "amenities.pool")}
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3">{t("detail.payment")}</h2>
              <Row label={t("detail.installment")}>
                {project.installmentAvailable ? (
                  <span className="text-green-700">{t("detail.installmentYes")}</span>
                ) : (
                  <span className="text-gray-500">{t("detail.installmentNo")}</span>
                )}
              </Row>
              {project.installmentAvailable && project.downPaymentPercent != null && (
                <Row label={t("detail.downPayment")}>{project.downPaymentPercent}%</Row>
              )}
              {project.installmentAvailable && project.installmentMonths && (
                <Row label={t("detail.installmentMonths")}>{t("detail.months", { count: project.installmentMonths })}</Row>
              )}
            </section>
          </div>

          {/* Unit types */}
          {project.unitTypes.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-teal-950 mb-4">{t("detail.unitTypes")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {project.unitTypes.map((unit) => (
                  <UnitTypeCard
                    key={unit.id}
                    unit={unit}
                    onAsk={openLead}
                    onOpenImage={(imgs, index) => setLightbox({ images: imgs, index })}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Video / tour */}
          {(embed || project.tourUrl) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {embed && (
                <section className="card p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3 flex items-center gap-2"><Video className="w-4 h-4" />{t("detail.video")}</h2>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src={embed} title={t("detail.video")} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                </section>
              )}
              {project.tourUrl && (
                <section className="card p-6 flex flex-col justify-center items-start gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600">{t("detail.tour")}</h2>
                  <Button asChild className="bg-teal-900 hover:bg-teal-800">
                    <a href={project.tourUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />{t("detail.openTour")}</a>
                  </Button>
                </section>
              )}
            </div>
          )}

          {/* Map */}
          {coords && (
            <section className="card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-600 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" />{t("detail.map")}</h2>
              <div className="h-[320px] sm:h-[380px] rounded-xl overflow-hidden">
                <MapboxMap latitude={coords.lat} longitude={coords.lng} labels={{ view2d: "2D", view3d: "3D" }} />
              </div>
            </section>
          )}

          {/* Related */}
          {project.relatedProjects && project.relatedProjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-teal-950">{t("detail.related")}</h2>
                <Link href={ROUTES.DEVELOPER(project.developer.slug)} className="text-sm font-semibold text-teal-700 hover:text-amber-600">
                  {t("detail.allDeveloperProjects")} →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {project.relatedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>

      <MobileContactBar
        phone={phone}
        whatsappText={`${title} · buildup.ge`}
        callLabel={t("detail.call")}
        whatsappLabel={t("detail.whatsapp")}
        action={{ label: t("detail.requestConsultation"), onClick: () => openLead(null) }}
      />

      <Lightbox
        open={!!lightbox}
        close={() => setLightbox(null)}
        slides={(lightbox?.images ?? []).map((src) => ({ src }))}
        index={lightbox?.index ?? 0}
      />

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("lead.title")}</DialogTitle>
          </DialogHeader>
          <LeadForm
            key={leadUnit?.id ?? "any"}
            projectId={project.id}
            unitTypes={project.unitTypes}
            initialUnitTypeId={leadUnit?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
