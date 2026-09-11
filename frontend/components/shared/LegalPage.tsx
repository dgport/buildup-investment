import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ScrollText } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

type Section = { h: string; p: string };

/** Privacy / Terms page body – copy lives in messages/{locale}/common.json → legal.* */
export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = await getTranslations("common");
  const sections = t.raw(`legal.${kind}.sections`) as Section[];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-teal-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm text-teal-100/70 hover:text-amber-300 mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t("nav.home")}
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-400 text-teal-950 p-2.5">
              <ScrollText className="w-5 h-5" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold">{t(`legal.${kind}.title`)}</h1>
          </div>
          <p className="text-xs text-teal-100/60 mt-4">{t("legal.updated")}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-base text-slate-600 leading-relaxed mb-8">{t(`legal.${kind}.intro`)}</p>
        <ol className="space-y-6">
          {sections.map((s, i) => (
            <li key={s.h} className="card p-6">
              <h2 className="font-bold text-teal-950 flex items-start gap-3">
                <span className="text-amber-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {s.h}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-2 pl-8">{s.p}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-slate-500 mt-10">
          <Link href={kind === "privacy" ? ROUTES.TERMS : ROUTES.PRIVACY} className="text-teal-800 font-semibold hover:text-amber-600">
            {kind === "privacy" ? t("legal.terms.title") : t("legal.privacy.title")} →
          </Link>
        </p>
      </article>
    </div>
  );
}
