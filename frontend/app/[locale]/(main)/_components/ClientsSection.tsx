"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

type Clients = {
  name: string;
  logo?: string;
  type?: "image" | "text";
};

const partners: Clients[] = [
  { name: "Aisi", logo: "/partners/Aisi.png" },
  { name: "Alliance", logo: "/partners/Alliance.png" },
  { name: "Orbi", logo: "/partners/Orbi.jpg" },
  { name: "Petra", logo: "/partners/Petra.png" },
  { name: "Sbuilding", logo: "/partners/Sbuilding.webp" },
];

const Logo = ({ logo, name, type, isTouch }: Clients & { isTouch: boolean }) => {
  const isTextLogo = type === "text" || !logo;

  return (
    <div
      className={`mx-6 md:mx-8 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm
        h-[72px] w-[150px]
        md:h-[84px] md:w-[180px]
        lg:h-[96px] lg:w-[210px]
        xl:h-[104px] xl:w-[230px]
        p-4
        ${!isTouch ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-teal-100" : ""}`}
    >
      {isTextLogo ? (
        <span className="font-bold text-teal-900 text-xl">{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          loading="lazy"
          className="object-contain max-h-full max-w-full rounded-lg"
        />
      )}
    </div>
  );
};

export default function ClientsSection() {
  const t = useTranslations("main");
  const isTouch = !useMediaQuery("(hover: hover)", false);

  return (
    <section className="relative z-10 bg-[#f3f5f4] overflow-hidden py-14 md:py-20 pb-24 md:pb-28">
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left { animation: scrollLeft 40s linear infinite; }
        .animate-marquee-left:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-left { animation: none; flex-wrap: wrap; justify-content: center; row-gap: 1rem; }
        }
      `}</style>

      <motion.div
        className="mx-auto flex flex-col items-center text-center max-w-7xl mb-10 px-6"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
      >
        <div className="flex items-center justify-center w-full gap-3">
          <div className="h-0.5 rounded-full bg-amber-400 w-8 md:w-10" />
          <span className="font-semibold uppercase text-teal-800 text-sm md:text-base tracking-[0.25em]">
            {t("clientsSectionLabel")}
          </span>
          <div className="h-0.5 rounded-full bg-amber-400 w-8 md:w-10" />
        </div>
      </motion.div>

      <div className="relative">
        <motion.div
          className="flex overflow-hidden relative py-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" as const }}
        >
          <div className="absolute inset-y-0 left-0 z-10 pointer-events-none bg-gradient-to-r from-[#f3f5f4] to-transparent w-24 md:w-40" />
          <div className="absolute inset-y-0 right-0 z-10 pointer-events-none bg-gradient-to-l from-[#f3f5f4] to-transparent w-24 md:w-40" />
          <div className="flex animate-marquee-left whitespace-nowrap">
            {[...partners, ...partners, ...partners, ...partners].map((p, i) => (
              <Logo key={`r1-${i}`} {...p} isTouch={isTouch} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
