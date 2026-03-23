"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Hammer, TrendingUp, CheckCircle2 } from "lucide-react";

const icons = [Building2, Hammer, TrendingUp, CheckCircle2];

const cardThemes = [
  {
    bg: "from-emerald-50 via-lime-50 to-white",
    iconGradient:
      "linear-gradient(135deg, #1E5C38 0%, #3D8B5E 60%, #7DB84A 100%)",
    iconBorder: "rgba(125,184,74,0.35)",
    iconShadow: "0 8px 24px -4px rgba(125,184,74,0.3)",
    border: "rgba(168,196,74,0.3)",
    hoverBorderTop:
      "linear-gradient(90deg, transparent, #A8C44A, #5A9E6F, transparent)",
    hoverGlow: "0 20px 60px -12px rgba(90,158,111,0.2)",
    text: "#1E3A2A",
    muted: "#4A6858",
    accent: "#5A9E6F",
  },
  {
    bg: "from-teal-50 via-green-50 to-white",
    iconGradient:
      "linear-gradient(135deg, #1A5C4E 0%, #2D8C6E 60%, #5AB884 100%)",
    iconBorder: "rgba(90,184,132,0.35)",
    iconShadow: "0 8px 24px -4px rgba(90,184,132,0.3)",
    border: "rgba(90,184,132,0.3)",
    hoverBorderTop:
      "linear-gradient(90deg, transparent, #5AB884, #2D8C6E, transparent)",
    hoverGlow: "0 20px 60px -12px rgba(45,140,110,0.2)",
    text: "#1A3A30",
    muted: "#3A6050",
    accent: "#2D8C6E",
  },
  {
    bg: "from-lime-50 via-yellow-50 to-white",
    iconGradient:
      "linear-gradient(135deg, #3D5C1A 0%, #6E8C2D 60%, #A8C44A 100%)",
    iconBorder: "rgba(168,196,74,0.35)",
    iconShadow: "0 8px 24px -4px rgba(168,196,74,0.3)",
    border: "rgba(168,196,74,0.3)",
    hoverBorderTop:
      "linear-gradient(90deg, transparent, #C9A84C, #A8C44A, transparent)",
    hoverGlow: "0 20px 60px -12px rgba(168,196,74,0.2)",
    text: "#2A3A1A",
    muted: "#506040",
    accent: "#6E8C2D",
  },
  {
    bg: "from-green-50 via-emerald-50 to-white",
    iconGradient:
      "linear-gradient(135deg, #1E4A2A 0%, #2E7A44 60%, #5AAA6E 100%)",
    iconBorder: "rgba(90,170,110,0.35)",
    iconShadow: "0 8px 24px -4px rgba(90,170,110,0.3)",
    border: "rgba(90,170,110,0.3)",
    hoverBorderTop:
      "linear-gradient(90deg, transparent, #5AAA6E, #2E7A44, transparent)",
    hoverGlow: "0 20px 60px -12px rgba(46,122,68,0.2)",
    text: "#1A3A22",
    muted: "#3A5E42",
    accent: "#2E7A44",
  },
];

export default function SuggestSection() {
  const t = useTranslations("main");
  const items = t.raw("items") as { header: string; text: string }[];

  return (
    <section className="relative w-full bg-[#F9F7F2] py-10 px-6 sm:px-16 md:px-20 lg:py-20 xl:px-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 10% 20%, rgba(168,196,74,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 80%, rgba(90,158,111,0.06) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg width='52' height='52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0 L52 26 L26 52 L0 26 Z' fill='none' stroke='rgba(90,158,111,0.04)' stroke-width='1'/%3E%3C/svg%3E")
          `,
          backgroundSize: "auto, auto, 52px 52px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-14 lg:mb-18">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#A8C44A]/40 bg-white/70 backdrop-blur-sm shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            {/* FIX: was t("badge"), now t("suggestBadge") */}
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3D6B4F]">
              {t("suggestBadge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#1E3A2A]">
            {t("sectionTitle")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4A6858]/70 max-w-xl mx-auto leading-relaxed">
            {t("sectionSubtitle")}
          </p>
        </div>

        <div className="w-full lg:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {items.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-full sm:basis-1/2"
                >
                  <SuggestCard
                    item={item}
                    Icon={icons[index]}
                    theme={cardThemes[index % cardThemes.length]}
                    size="sm"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-8">
              <CarouselPrevious className="border-[#A8C44A]/40 text-[#3D6B4F] hover:bg-[#A8C44A]/10 hover:border-[#A8C44A]" />
              <CarouselNext className="border-[#A8C44A]/40 text-[#3D6B4F] hover:bg-[#A8C44A]/10 hover:border-[#A8C44A]" />
            </div>
          </Carousel>
        </div>

        <div className="hidden w-full grid-cols-2 gap-5 lg:grid">
          {items.map((item, index) => (
            <SuggestCard
              key={index}
              item={item}
              Icon={icons[index]}
              theme={cardThemes[index % cardThemes.length]}
              size="lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type Theme = (typeof cardThemes)[number];

type SuggestCardProps = {
  item: { header: string; text: string };
  Icon: React.ElementType;
  theme: Theme;
  size: "sm" | "lg";
};

function SuggestCard({ item, Icon, theme, size }: SuggestCardProps) {
  const isLg = size === "lg";

  return (
    <Card
      className={`group relative flex flex-col items-start justify-start bg-gradient-to-br ${theme.bg} transition-all duration-300 overflow-hidden rounded-2xl ${
        isLg ? "p-8 hover:-translate-y-1" : "min-h-[200px] p-6"
      }`}
      style={{
        border: `1px solid ${theme.border}`,
        boxShadow: "0 2px 16px -4px rgba(61,107,79,0.07)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: theme.hoverBorderTop }}
      />

      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at top right, ${theme.accent}18, transparent 70%)`,
        }}
      />

      <CardContent className="p-0 flex flex-col gap-4 relative z-10 w-full">
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-105"
            style={{
              background: theme.iconGradient,
              border: `1px solid ${theme.iconBorder}`,
              boxShadow: "0 4px 12px -2px rgba(61,107,79,0.15)",
            }}
          >
            <Icon
              className={`text-[#F0E68C] ${isLg ? "w-7 h-7" : "w-5 h-5"}`}
            />
          </div>
          <h3
            className={`font-bold leading-snug ${isLg ? "text-xl pt-1.5" : "text-base pt-1"}`}
            style={{ color: theme.text }}
          >
            {item.header}
          </h3>
        </div>

        <p
          className={`leading-relaxed ${isLg ? "text-[15px]" : "text-sm"}`}
          style={{ color: theme.muted }}
        >
          {item.text}
        </p>
      </CardContent>

      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accent}66, transparent)`,
        }}
      />
    </Card>
  );
}
