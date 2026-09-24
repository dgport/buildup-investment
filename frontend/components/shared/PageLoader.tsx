"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

export function PageLoader() {
  const t = useTranslations("common.actions");

  return (
    <div
      role="status"
      aria-live="polite"
      className="page-loader flex items-center justify-center bg-slate-50 px-4"
    >
      <div className="flex flex-col items-center gap-4 text-teal-900">
        <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin motion-reduce:animate-none" />
        <span className="text-sm font-medium">{t("loading")}</span>
      </div>
    </div>
  );
}
