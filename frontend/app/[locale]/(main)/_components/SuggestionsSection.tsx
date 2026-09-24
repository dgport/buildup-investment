"use client";

import { useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Building2, Hammer, TrendingUp, CheckCircle2 } from "lucide-react";

const icons = [Building2, Hammer, TrendingUp, CheckCircle2];

export default function SuggestSection() {
  const t = useTranslations("main");
  const items = t.raw("items") as { header: string; text: string }[];

  return (
    <section className="relative w-full bg-white py-12 lg:py-16 px-6 sm:px-16 md:px-20 xl:px-24 overflow-hidden">
      {/* subtle brand grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(19,78,74,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(19,78,74,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-teal-100 bg-teal-50 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
              {t("suggestBadge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-teal-950">
            {t("sectionTitle")}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            {t("sectionSubtitle")}
          </p>
          <div className="divider-brand mx-auto mt-6" />
        </div>

        <div className="w-full lg:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {items.map((item, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2">
                  <SuggestCard item={item} Icon={icons[index]} index={index} size="sm" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-8">
              <CarouselPrevious className="border-teal-200 text-teal-800 hover:bg-teal-50 hover:border-teal-400" />
              <CarouselNext className="border-teal-200 text-teal-800 hover:bg-teal-50 hover:border-teal-400" />
            </div>
          </Carousel>
        </div>

        <div className="hidden w-full grid-cols-2 gap-6 lg:grid">
          {items.map((item, index) => (
            <SuggestCard key={index} item={item} Icon={icons[index]} index={index} size="lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

type SuggestCardProps = {
  item: { header: string; text: string };
  Icon: React.ElementType;
  index: number;
  size: "sm" | "lg";
};

function SuggestCard({ item, Icon, index, size }: SuggestCardProps) {
  const isLg = size === "lg";

  return (
    <article
      className={`group card card-hover relative flex flex-col h-full overflow-hidden ${
        isLg ? "p-8" : "min-h-[220px] p-6"
      }`}
    >
      {/* amber top line on hover */}
      <span className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      {/* soft teal glow */}
      <span className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-teal-100/60 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="shrink-0 rounded-2xl bg-teal-900 text-amber-300 shadow-lg shadow-teal-900/20 p-3 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <Icon className={isLg ? "w-7 h-7" : "w-5 h-5"} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className={`font-bold leading-snug text-teal-950 ${isLg ? "text-xl" : "text-base"}`}>
            {item.header}
          </h3>
        </div>
      </div>

      <p className={`relative z-10 mt-4 leading-relaxed text-slate-600 ${isLg ? "text-[15px]" : "text-sm"}`}>
        {item.text}
      </p>
    </article>
  );
}
