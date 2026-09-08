import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export default async function Unauthorized() {
  const t = await getTranslations("common.unauthorized");

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-14 h-14 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-teal-950 mb-2">{t("title")}</h1>
        <p className="text-teal-800/70 mb-8">{t("description")}</p>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-sm font-semibold transition-colors"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
