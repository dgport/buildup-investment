"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

const Logo = ({
  logo,
  name,
  type,
  isTouch,
}: Clients & { isTouch: boolean }) => {
  const isTextLogo = type === "text" || !logo;

  return (
    <div
      className={`mx-12 flex items-center justify-center
        h-[60px] w-[130px]
        md:h-[76px] md:w-[160px]
        lg:h-[88px] lg:w-[190px]
        xl:h-[100px] xl:w-[220px]
        3xl:h-[120px] 3xl:w-[260px] 3xl:mx-14
        4xl:h-[140px] 4xl:w-[300px] 4xl:mx-16
        5xl:h-[170px] 5xl:w-[360px] 5xl:mx-20
        opacity-100
        ${!isTouch ? "transition-all duration-300 hover:scale-110" : ""}`}
    >
      {isTextLogo ? (
        <span className="font-bold text-gray-700 text-xl 3xl:text-2xl 4xl:text-3xl 5xl:text-4xl">
          {name}
        </span>
      ) : (
        <img
          src={logo}
          alt={name}
          className="object-contain max-h-full max-w-full rounded-2xl"
        />
      )}
    </div>
  );
};

export default function ClientsSection() {
  const t = useTranslations("main");
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    setIsTouch(!window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <section
      className="relative z-10 bg-[#f3f5f4] overflow-hidden
      py-10 md:pt-16 pb-32
      3xl:pt-20 3xl:pb-36
      4xl:pt-24 4xl:pb-40
      5xl:pt-32 5xl:pb-52"
    >
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left { animation: scrollLeft 35s linear infinite; }
      `}</style>

      <motion.div
        className="mx-auto flex flex-col items-center text-center
          max-w-7xl mb-12
          3xl:max-w-[1600px] 3xl:mb-14
          4xl:max-w-[1800px] 4xl:mb-16
          5xl:max-w-[2100px] 5xl:mb-20"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
      >
        <div className="flex items-center justify-center w-full gap-3 mb-3 3xl:gap-4 4xl:gap-5 5xl:gap-6">
          <div className="h-0.5 bg-[#2563eb] w-8 md:w-10 3xl:w-12 4xl:w-14 5xl:w-16" />
          <span
            className="font-medium uppercase text-gray-500
            text-base md:text-lg tracking-[2px]
            3xl:text-xl 3xl:tracking-[3px]
            4xl:text-2xl 4xl:tracking-[3px]
            5xl:text-3xl 5xl:tracking-[4px]"
          >
            {t("clientsSectionLabel")}
          </span>
          <div className="h-0.5 bg-[#2563eb] w-8 md:w-10 3xl:w-12 4xl:w-14 5xl:w-16" />
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
          <div className="absolute inset-y-0 left-0 z-10 pointer-events-none bg-gradient-to-r from-[#f3f5f4] to-transparent w-32 3xl:w-40 4xl:w-52 5xl:w-64" />
          <div className="absolute inset-y-0 right-0 z-10 pointer-events-none bg-gradient-to-l from-[#f3f5f4] to-transparent w-32 3xl:w-40 4xl:w-52 5xl:w-64" />
          <div className="flex animate-marquee-left whitespace-nowrap">
            {[...partners, ...partners, ...partners, ...partners].map(
              (p, i) => (
                <Logo key={`r1-${i}`} {...p} isTouch={isTouch} />
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
