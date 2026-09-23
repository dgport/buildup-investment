"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Camera, ClipboardList, UserPlus, BadgeCheck } from "lucide-react";
import { useHasToken } from "@/lib/hooks/useAuth";
import { IS_RENT_SITE, SALES_URL } from "@/lib/market";
import { ROUTES } from "@/lib/constants/routes";

const STEPS = [
  { icon: UserPlus, title: "step1Title", text: "step1Text" },
  { icon: ClipboardList, title: "step2Title", text: "step2Text" },
  { icon: Camera, title: "step3Title", text: "step3Text" },
] as const;

/** Home section that explains how owners publish their own listings. */
export default function ListPropertyCta() {
  const t = useTranslations("main.listCta");
  const hasToken = useHasToken();
  const href = IS_RENT_SITE ? `${SALES_URL}/properties/new?dealType=RENT` : hasToken ? ROUTES.PROPERTY_NEW : `${ROUTES.SIGNUP}`;

  return (
    <section className="relative overflow-hidden bg-[#f3f5f4] py-16 sm:py-20 px-6 md:px-12 lg:px-20">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-amber-400" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-[0.25em]">
              {t("label")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-950 leading-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-teal-800/70 text-lg leading-relaxed">{t("subtitle")}</p>

          <div className="mt-6 inline-flex items-center gap-2 bg-white border border-teal-100 rounded-full pl-1.5 pr-4 py-1.5 shadow-soft">
            <span className="bg-amber-400 text-teal-950 text-xs font-black uppercase px-2.5 py-1 rounded-full">
              {t("free")}
            </span>
            <span className="text-sm text-teal-800">{t("freeHint")}</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={href}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal-900 hover:bg-teal-800 text-white font-bold text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-teal-900/25"
            >
              {t("cta")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-teal-200 hover:border-amber-400 text-teal-900 font-semibold text-sm transition-colors bg-white"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </div>

        <ol id="how-it-works" className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card card-hover p-6 relative">
              <span className="absolute top-4 right-4 text-4xl font-black text-teal-950/5 select-none">
                {i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl bg-teal-900 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-teal-950 mb-1">{t(title)}</h3>
              <p className="text-sm text-teal-800/70 leading-relaxed">{t(text)}</p>
              {i === STEPS.length - 1 && (
                <BadgeCheck className="w-5 h-5 text-green-600 absolute bottom-4 right-4" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
