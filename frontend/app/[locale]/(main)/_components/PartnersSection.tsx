"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";

const BafLogo = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a2b5e] rounded-full">
    <span className="text-[#f0c040] font-black text-[17px] leading-none tracking-wide">
      BAF
    </span>
    <span className="text-white/70 text-[6px] uppercase tracking-wider mt-0.5 text-center leading-tight px-1">
      Georgia
    </span>
  </div>
);

const AccaLogo = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#c8102e] rounded-full">
    <span className="text-white font-black text-[17px] tracking-wide leading-none">
      ACCA
    </span>
  </div>
);

const IfacLogo = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#003087] rounded-full">
    <span className="text-white font-black text-[18px] leading-none tracking-wider">
      IFAC
    </span>
    <div className="w-8 h-[1.5px] bg-white/40 mt-1" />
  </div>
);

const SarasLogo = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0057a8] rounded-full">
    <span className="text-white font-black text-[15px] leading-none tracking-wider">
      SARAS
    </span>
    <span className="text-white/60 text-[5.5px] uppercase tracking-widest mt-1">
      Georgia
    </span>
  </div>
);

const IasbLogo = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#00539b] rounded-full">
    <span className="text-white font-black text-[12px] leading-none tracking-wider">
      IAASB
    </span>
    <div className="w-8 h-[1.5px] bg-white/40 mt-1" />
  </div>
);

const logos: { alt: string; Logo: () => React.ReactElement }[] = [
  { alt: "BAF", Logo: BafLogo },
  { alt: "ACCA", Logo: AccaLogo },
  { alt: "IFAC", Logo: IfacLogo },
  { alt: "SARAS", Logo: SarasLogo },
  { alt: "IAASB", Logo: IasbLogo },
];

const items = [
  {
    titleKey: "partnersItem1Title",
    descKey: "partnersItem1Desc",
    icon: "M25,2L5,12v11c0,12.4,8.6,24,20,27c11.4-3,20-14.6,20-27V12L25,2z M22,35l-8-8l2.8-2.8L22,29.4l11.2-11.2L36,21L22,35z",
  },
  {
    titleKey: "partnersItem2Title",
    descKey: "partnersItem2Desc",
    icon: "M17,22c4.4,0,8-3.6,8-8s-3.6-8-8-8s-8,3.6-8,8S12.6,22,17,22z M17,26c-5.3,0-16,2.7-16,8v4h32v-4C33,28.7,22.3,26,17,26z",
  },
  {
    titleKey: "partnersItem3Title",
    descKey: "partnersItem3Desc",
    icon: "M25,3C12.9,3,3,12.9,3,25s9.9,22,22,22s22-9.9,22-22S37.1,3,25,3z M25,11c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S23.3,11,25,11z M30,37H20v-2h3V23h-3v-2h7v14h3V37z",
  },
];

const ORBIT_DURATION = 20;

const fadeInLeft: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 80, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

const PartnersSection = () => {
  const t = useTranslations("main");

  return (
    <section className="overflow-hidden bg-[#F3F5F4] py-10 md:py-16 3xl:py-20 4xl:py-24 5xl:py-32">
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes counter-orbit {
          from { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) translateY(-50%) rotate(-360deg); }
        }
        .orbit-ring {
          position: absolute;
          inset: 6%;
          transform-origin: center;
          animation: orbit ${ORBIT_DURATION}s linear infinite;
          will-change: transform;
        }
        .orbit-logo {
          position: absolute;
          top: 0;
          left: 50%;
          animation: counter-orbit ${ORBIT_DURATION}s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-[2000px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 2xl:px-32 3xl:px-44 4xl:px-56 5xl:px-72">
        <div className="flex flex-col lg:flex-row items-center lg:gap-16 xl:gap-20 3xl:gap-24 4xl:gap-28 5xl:gap-36">
          <div className="lg:w-[47%] w-full mb-12 lg:mb-0">
            <motion.div
              className="flex items-center gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-6 mb-4 3xl:mb-5 4xl:mb-6 5xl:mb-8"
              custom={0}
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="bg-blue-600 h-0.5 w-8 md:w-10 3xl:w-12 4xl:w-14 5xl:w-16" />
              <span className="text-gray-500 font-medium tracking-widest uppercase text-base md:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">
                {t("partnersSectionLabel")}
              </span>
              <div className="bg-blue-600 h-0.5 w-8 md:w-10 3xl:w-12 4xl:w-14 5xl:w-16" />
            </motion.div>

            <motion.h2
              className="text-blue-600 font-bold leading-tight mb-6 3xl:mb-7 4xl:mb-8 5xl:mb-10 text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl 5xl:text-8xl"
              custom={1}
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t("partnersHeading")}
            </motion.h2>

            <motion.p
              className="text-gray-500 leading-relaxed mb-4 3xl:mb-5 4xl:mb-6 5xl:mb-8 text-base md:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-2xl"
              custom={2}
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t("partnersBody")}
            </motion.p>

            <div className="space-y-6 3xl:space-y-7 4xl:space-y-8 5xl:space-y-10">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 3xl:gap-5 4xl:gap-6 5xl:gap-7"
                  custom={3 + i}
                  variants={fadeInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200 w-12 h-12 3xl:w-14 3xl:h-14 3xl:rounded-2xl 4xl:w-16 4xl:h-16 5xl:w-20 5xl:h-20 5xl:rounded-2xl">
                    <svg
                      className="fill-white w-6 h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-10 5xl:h-10"
                      viewBox="0 0 50 50"
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1 3xl:mb-1.5 4xl:mb-2 text-base 3xl:text-lg 4xl:text-xl 5xl:text-2xl">
                      {t(item.titleKey)}
                    </h4>
                    <p className="text-gray-500 leading-relaxed text-sm 3xl:text-base 4xl:text-lg 5xl:text-xl">
                      {t(item.descKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-[53%] w-full flex items-center justify-center relative min-h-[420px] md:min-h-[520px] 3xl:min-h-[600px] 4xl:min-h-[680px] 5xl:min-h-[800px]">
            <div className="absolute w-[440px] h-[440px] 3xl:w-[520px] 3xl:h-[520px] 4xl:w-[600px] 4xl:h-[600px] 5xl:w-[720px] 5xl:h-[720px] bg-blue-400/10 rounded-full blur-[100px]" />

            <motion.div
              className="relative w-full aspect-square flex items-center justify-center max-w-[380px] md:max-w-[460px] 3xl:max-w-[540px] 4xl:max-w-[620px] 5xl:max-w-[740px]"
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="absolute inset-[6%] border border-blue-200/50 rounded-full" />
              <div
                className="absolute rounded-full border border-blue-100/30"
                style={{ inset: "20%" }}
              />

              <motion.div
                className="z-20 rounded-full flex items-center justify-center border border-white/20 overflow-hidden w-32 h-32 md:w-44 md:h-44 3xl:w-52 3xl:h-52 4xl:w-60 4xl:h-60 5xl:w-72 5xl:h-72"
                style={{
                  background:
                    "linear-gradient(135deg, #0f1f5c 0%, #1a3a8f 35%, #1d4ed8 65%, #2563eb 100%)",
                  boxShadow:
                    "0 0 0 5px rgba(29,78,216,0.18), 0 8px 48px rgba(15,31,92,0.65), 0 2px 16px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.6,
                }}
              >
                <div className="relative w-[95%] h-[85%]">
                  <Image
                    src="/PrestigeLogo.png"
                    alt="Prestige Audit"
                    fill
                    className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </motion.div>

              {logos.map(({ alt, Logo }, index) => {
                const delay = `-${(index / logos.length) * ORBIT_DURATION}s`;
                return (
                  <div
                    key={alt}
                    className="orbit-ring"
                    style={{ animationDelay: delay }}
                  >
                    <div
                      className="orbit-logo rounded-full overflow-hidden border-2 border-white/80 shadow-md w-14 h-14 md:w-20 md:h-20 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28 5xl:w-32 5xl:h-32"
                      style={{ animationDelay: delay }}
                    >
                      <Logo />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
