"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSavedProperties, toggleSavedProperty } from "@/lib/hooks/useSavedProperties";
import { SAVED_PROPERTIES_LIMIT } from "@/lib/saved-properties";
import { cn } from "@/lib/utils";

export function SavePropertyButton({ id, compact = false, className }: { id: string; compact?: boolean; className?: string }) {
  const t = useTranslations("common.saved");
  const { ids, ready } = useSavedProperties();
  const saved = ids.includes(id);

  return (
    <button
      type="button"
      disabled={!ready}
      aria-label={saved ? t("remove") : t("add")}
      aria-pressed={saved}
      title={saved ? t("remove") : t("add")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const result = toggleSavedProperty(id);
        if (result === "limit") toast.error(t("limit", { limit: SAVED_PROPERTIES_LIMIT }));
        else if (result === "unavailable") toast.error(t("storageError"));
        else toast.success(t(result));
      }}
      className={cn(
        "relative z-20 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-900/15 bg-white/95 text-teal-900 shadow-sm transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50",
        !compact && "px-4 text-sm font-semibold",
        saved && "text-rose-600 border-rose-200",
        className,
      )}
    >
      <Heart className={cn("h-5 w-5", saved && "fill-current")} aria-hidden />
      {!compact && (saved ? t("saved") : t("save"))}
    </button>
  );
}
