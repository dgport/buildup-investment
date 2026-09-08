import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2, Home } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export default async function NotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-teal-950/10 mb-2">404</p>
        <h1 className="text-2xl font-bold text-teal-950 mb-2">{t("title")}</h1>
        <p className="text-teal-800/70 mb-8">{t("description")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            {t("home")}
          </Link>
          <Link
            href={ROUTES.PROPERTIES}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-teal-200 hover:border-teal-400 text-teal-900 text-sm font-semibold transition-colors"
          >
            <Building2 className="w-4 h-4" />
            {t("properties")}
          </Link>
        </div>
      </div>
    </div>
  );
}
