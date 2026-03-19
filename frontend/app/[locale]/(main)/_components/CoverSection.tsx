"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export default function CoverSection() {
  const t = useTranslations("main");

  const switchingTexts: string[] = t.raw("switchingTexts") as string[];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const checkTime = setInterval(() => {
      if (video.currentTime >= 10) {
        video.currentTime = 0;
        video.play();
      }
    }, 100);
    return () => clearInterval(checkTime);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % switchingTexts.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [switchingTexts.length]);

  return (
    <div className="relative w-full h-[60vh] min-h-screen overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute -mt-10 md:mt-0 inset-0 w-full h-full object-cover"
      >
        <source src="/Video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-teal-800/50 to-teal-950/80" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-8 text-center max-w-full pb-20 sm:pb-0">
        <div className="relative h-12 sm:h-24 md:h-28 w-full flex items-center justify-center overflow-hidden">
          <h1
            className={`text-xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white transition-all duration-500 px-2 ${
              isAnimating
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
            style={{ wordBreak: "break-word", hyphens: "auto" }}
          >
            {switchingTexts[currentTextIndex]}
          </h1>
        </div>
        <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-amber-100/80 max-w-xs sm:max-w-lg md:max-w-2xl leading-relaxed px-2">
          {t("subtitle")}
        </p>

        <div className="flex gap-1.5 sm:gap-2 mt-4 sm:mt-8">
          {switchingTexts.map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentTextIndex(index)}
              aria-label={t("dotAriaLabel", { index: index + 1 })}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentTextIndex
                  ? "bg-amber-400 w-4 sm:w-8"
                  : "w-1.5 sm:w-2 bg-amber-100/40 hover:bg-amber-100/60"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mt-5 sm:mt-12 w-full sm:w-auto px-4 sm:px-0">
          <Button className="px-8 sm:px-12 py-4 sm:py-6 bg-amber-400 hover:bg-amber-300 text-teal-950 font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-400/20 text-sm sm:text-lg">
            {t("cta")}
          </Button>
        </div>
      </div>

      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
        <span className="text-amber-400/60 text-xs tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">
          {t("since")}
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 items-center">
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
        <span className="text-amber-400/60 text-xs tracking-widest rotate-90 origin-center whitespace-nowrap">
          {t("region")}
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
      </div>
    </div>
  );
}
