"use client";

import { useRef } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function AboutParallax() {
  const t = useTranslations("main");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgYMotion = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgY = isDesktop ? bgYMotion : "0%";

  const stats = [
    { value: t("aboutStat1Value"), label: t("aboutStat1Label") },
    { value: t("aboutStat2Value"), label: t("aboutStat2Label") },
    { value: t("aboutStat3Value"), label: t("aboutStat3Label") },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#f3f5f4]"
    >
      <div className="absolute top-0 left-0 w-full h-20 3xl:h-24 4xl:h-28 5xl:h-36 z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <polygon points="0,0 1440,0 1440,0 720,80 0,0" fill="#f3f5f4" />
        </svg>
      </div>

      <div className="relative overflow-hidden bg-[#f3f5f4] min-h-[600px] md:min-h-[800px] 3xl:min-h-[900px] 4xl:min-h-[1000px] 5xl:min-h-[1200px]">
        <motion.div
          style={{
            y: bgY,
            backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=80&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            contain: "strict",
          }}
          className="absolute inset-[-12%] will-change-transform"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-teal-900/50 to-teal-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent" />

        <div className="relative z-10 flex items-center min-h-[600px] md:min-h-[800px] 3xl:min-h-[900px] 4xl:min-h-[1000px] 5xl:min-h-[1200px] py-28 md:py-36 3xl:py-44 4xl:py-52 5xl:py-64">
          <div className="w-full mx-auto px-6 lg:px-24 3xl:px-36 4xl:px-48 5xl:px-64 max-w-[1440px] 3xl:max-w-[1700px] 4xl:max-w-[1900px] 5xl:max-w-[2200px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 3xl:gap-24 4xl:gap-28 5xl:gap-36 items-center">
              {/* Left: text */}
              <div className="text-white">
                <motion.div
                  {...fadeUp(0)}
                  className="flex items-center gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-6 mb-5 3xl:mb-6 4xl:mb-7 5xl:mb-9"
                >
                  <Building2 className="shrink-0 text-amber-400 w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 5xl:w-7 5xl:h-7" />
                  <span className="text-amber-300 font-medium tracking-widest uppercase text-sm 3xl:text-base 4xl:text-lg 5xl:text-xl">
                    {t("aboutLabel")}
                  </span>
                  <span className="flex-1 max-w-[60px] 3xl:max-w-[80px] 4xl:max-w-[100px] 5xl:max-w-[120px] h-px bg-amber-400/40" />
                </motion.div>

                <motion.h2
                  {...fadeUp(0.12)}
                  className="text-white font-bold leading-tight mb-7 3xl:mb-8 4xl:mb-9 5xl:mb-12 text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl 5xl:text-8xl"
                >
                  {t("aboutHeadingRegular")}{" "}
                  <span className="italic text-amber-300">
                    {t("aboutHeadingItalic")}
                  </span>{" "}
                  {t("aboutHeadingSuffix")}
                </motion.h2>

                <motion.p
                  {...fadeUp(0.22)}
                  className="text-white/70 leading-relaxed mb-10 3xl:mb-12 4xl:mb-14 5xl:mb-16 max-w-[480px] 3xl:max-w-[560px] 4xl:max-w-[640px] 5xl:max-w-[760px] text-base md:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-2xl"
                >
                  {t("aboutBody")}
                </motion.p>

                <motion.div {...fadeUp(0.32)}>
                  <a
                    href="/properties"
                    className="group relative inline-flex items-center overflow-hidden rounded-full text-teal-950 font-semibold bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/40 hover:-translate-y-1 active:scale-95
                      gap-4 px-8 py-4 text-base
                      md:px-12 md:py-5
                      3xl:gap-5 3xl:px-14 3xl:py-6 3xl:text-lg
                      4xl:gap-6 4xl:px-16 4xl:py-7 4xl:text-xl
                      5xl:gap-7 5xl:px-20 5xl:py-8 5xl:text-2xl"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">{t("aboutCta")}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 27.7 18"
                      className="relative z-10 fill-current transition-transform duration-300 group-hover:translate-x-1 w-5 h-3.5 3xl:w-6 3xl:h-4 4xl:w-7 4xl:h-[18px] 5xl:w-8 5xl:h-5"
                    >
                      <path d="M12.1,18V10.6H0V7.4H12.1V0L27.7,9Z" />
                    </svg>
                  </a>
                </motion.div>
              </div>

              {/* Right: stats card */}
              <div className="hidden lg:flex justify-center">
                <div className="relative group">
                  <div
                    className="relative border border-amber-400/20 rounded-2xl bg-teal-950/60 shadow-2xl shadow-black/50 overflow-hidden
                      px-12 py-14
                      3xl:px-14 3xl:py-16
                      4xl:px-16 4xl:py-20
                      5xl:px-20 5xl:py-24"
                    style={{
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Reveal animation overlay */}
                    <motion.div
                      className="absolute inset-0 z-20 pointer-events-none"
                      style={{ background: "rgba(13,40,35,0.95)" }}
                      initial={{ opacity: 1 }}
                      whileInView={{ opacity: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: 0.18,
                        ease: "easeOut" as const,
                      }}
                    />

                    {/* Top accent line */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Logo */}
                    <div className="flex justify-center mb-8 3xl:mb-10 4xl:mb-12 5xl:mb-14">
                      <img
                        src="/Logo.png"
                        alt="Build Up Investment"
                        className="h-20 w-auto 3xl:h-24 4xl:h-28 5xl:h-36"
                      />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 3xl:gap-4 4xl:gap-5 my-5 3xl:my-6 4xl:my-7 5xl:my-8 justify-center">
                      <span className="h-px bg-amber-400/30 w-12 3xl:w-16 4xl:w-20 5xl:w-24" />
                      <span className="rounded-full bg-amber-400 w-1.5 h-1.5 3xl:w-2 3xl:h-2 4xl:w-2.5 4xl:h-2.5" />
                      <span className="h-px bg-amber-400/30 w-12 3xl:w-16 4xl:w-20 5xl:w-24" />
                    </div>

                    <div className="text-center text-white/50 tracking-widest mb-10 3xl:mb-12 4xl:mb-14 5xl:mb-16 text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg uppercase">
                      {t("aboutLocation")}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 border-t border-amber-400/10 gap-8 3xl:gap-10 4xl:gap-12 5xl:gap-14 pt-8 3xl:pt-10 4xl:pt-12 5xl:pt-14">
                      {stats.map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          className="text-center"
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: 0.3 + i * 0.1,
                            ease: "easeOut" as const,
                          }}
                        >
                          <div className="text-amber-400 font-bold mb-1 3xl:mb-1.5 4xl:mb-2 text-2xl 3xl:text-3xl 4xl:text-4xl 5xl:text-5xl">
                            {stat.value}
                          </div>
                          <div className="text-white/40 uppercase tracking-wider text-xs 3xl:text-sm 4xl:text-base 5xl:text-lg">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom chevron mask */}
      <div className="absolute bottom-0 left-0 w-full h-20 3xl:h-24 4xl:h-28 5xl:h-36 z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <polygon points="0,80 720,0 1440,80 1440,80 0,80" fill="#f3f5f4" />
        </svg>
      </div>
    </section>
  );
}
