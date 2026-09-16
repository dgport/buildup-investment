import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  BadgeDollarSign,
  ClipboardCheck,
  Gavel,
  ImageIcon,
  Lock,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

/** One icon per section, in the order of `terms.sections` in the messages. */
const ICONS: LucideIcon[] = [ShieldCheck, BadgeDollarSign, ImageIcon, ClipboardCheck, Gavel, Lock, RefreshCw];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: ROUTES.LISTING_TERMS },
  };
}

export default async function ListingTermsPage() {
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as { title: string; items: string[] }[];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative bg-teal-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 70% at 85% 0%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(20,184,166,0.15), transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/90 font-semibold mb-2">{t("eyebrow")}</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{t("title")}</h1>
          <p className="mt-3 text-teal-100/75 leading-relaxed">{t("subtitle")}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200">
            {t("versionLabel", { version: t("version") })}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        {sections.map((section, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <section key={section.title} className="card p-5 sm:p-6">
              <header className="flex items-center gap-3 mb-3">
                <span className={`rounded-xl p-2 shrink-0 shadow-sm ${i === 0 ? "bg-amber-400 text-teal-950" : "bg-teal-900 text-amber-300"}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <h2 className="font-bold text-teal-950">
                  <span className="text-slate-400 font-semibold mr-1.5 tabular-nums">{i + 1}.</span>
                  {section.title}
                </h2>
              </header>
              <ul className="space-y-2 pl-1">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <p className="text-sm text-slate-500 text-center pt-2">
          {t.rich("contactNote", {
            link: (chunks) => (
              <Link href={ROUTES.CONTACT} className="font-semibold text-teal-800 hover:text-amber-600 underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
