"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSavedProperties } from "@/lib/hooks/useSavedProperties";
import { ROUTES } from "@/lib/constants/routes";

export function SavedPropertiesLink() {
  const t = useTranslations("common.saved");
  const { ids } = useSavedProperties();
  return (
    <Link href={ROUTES.SAVED} aria-label={t("nav", { count: ids.length })} title={t("title")}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 text-amber-100 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">
      <Heart className="h-5 w-5" aria-hidden />
      {ids.length > 0 && <span aria-hidden className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-teal-950">{ids.length}</span>}
    </Link>
  );
}
