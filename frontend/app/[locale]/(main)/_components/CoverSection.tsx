"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/constants/routes";
import { IS_RENT_SITE } from "@/lib/market";
import HeroSearch from "./HeroSearch";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const reducedMotionSnapshot = () => window.matchMedia(motionQuery).matches;

export default function CoverSection() {
  const t = useTranslations("main");

  const switchingTexts: string[] = t.raw("switchingTexts") as string[];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, () => false);
  const stopped = paused || reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const syncPlayback = () => {
      if (stopped || document.hidden) video.pause();
      else void video.play().catch(() => { /* Autoplay may be blocked; keep the poster visible. */ });
    };
    const loopPreview = () => { if (video.currentTime >= 10) video.currentTime = 0; };
    video.addEventListener("timeupdate", loopPreview);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      video.removeEventListener("timeupdate", loopPreview);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [stopped]);

  useEffect(() => {
    if (stopped || switchingTexts.length < 2) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setIsAnimating(true);
      timeout = setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % switchingTexts.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [switchingTexts.length, stopped]);

  return (
    <div className="relative w-full min-h-svh overflow-hidden bg-teal-950">
      <video
        ref={videoRef}
        poster="/green.webp"
        preload="none"
        loop
        aria-hidden="true"
        muted
        playsInline
        className="absolute -mt-10 md:mt-0 inset-0 w-full h-full object-cover"
      >
        <source src="/Video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-teal-800/50 to-teal-950/80" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-svh px-4 sm:px-8 text-center max-w-full pt-28 pb-24 sm:pt-32">
        <div className="relative h-12 sm:h-24 md:h-28 w-full flex items-center justify-center overflow-hidden">
          <h1
            className={`text-xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white transition-all duration-500 px-2 ${
              isAnimating && !stopped
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
            style={{ wordBreak: "break-word", hyphens: "auto" }}
          >
            {switchingTexts[currentTextIndex % switchingTexts.length]}
          </h1>
        </div>
        <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-amber-100/80 max-w-xs sm:max-w-lg md:max-w-2xl leading-relaxed px-2">
          {t("subtitle")}
        </p>


        <HeroSearch />

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mt-5 sm:mt-8 w-full sm:w-auto px-4 sm:px-0">
          <Button
            asChild
            variant="ghost"
            className="px-8 py-4 sm:py-6 text-amber-100/90 hover:text-amber-300 hover:bg-white/10 font-semibold rounded-lg transition-all duration-300 text-sm sm:text-base"
          >
            <Link href={IS_RENT_SITE ? ROUTES.PROPERTIES : ROUTES.PROJECTS}>{t("hero.allProjects")} →</Link>
          </Button>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {switchingTexts.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => { setCurrentTextIndex(index); setPaused(true); setIsAnimating(false); }}
              aria-label={t("dotAriaLabel", { index: index + 1 })}
              aria-pressed={index === currentTextIndex}
              className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              <span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${index === currentTextIndex ? "bg-amber-400 w-7" : "w-2 bg-amber-100/50"}`} />
            </button>
          ))}
          {!reducedMotion && <button
            type="button"
            onClick={() => { setPaused(!paused); setIsAnimating(false); }}
            aria-label={t(paused ? "hero.playMotion" : "hero.pauseMotion")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-amber-100 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
          >{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</button>}
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
