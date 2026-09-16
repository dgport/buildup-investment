"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Agreement to the listing terms (private phone, watermark, possible paid
 * phone visibility). Shown on the last step of the new-listing wizard until
 * the owner has accepted the current terms version.
 */
export function ListingTermsConsent({
  alreadyAccepted,
  acceptedAt,
  checked,
  onCheckedChange,
  showError,
}: {
  alreadyAccepted: boolean;
  acceptedAt?: string | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showError: boolean;
}) {
  const t = useTranslations("terms.consent");
  const locale = useLocale();

  if (alreadyAccepted) {
    const date = acceptedAt
      ? new Date(acceptedAt).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-GB", { dateStyle: "long" })
      : "";
    return (
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
        {t("accepted", { date })}
      </p>
    );
  }

  const points = t.raw("points") as string[];

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-colors",
        showError && !checked ? "border-red-300 bg-red-50/60" : "border-teal-100 bg-teal-50/50",
      )}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="rounded-lg bg-teal-900 text-amber-300 p-1.5">
          <ShieldCheck className="w-4 h-4" />
        </span>
        <h3 className="font-bold text-teal-950">{t("title")}</h3>
      </div>

      <ul className="space-y-1.5 mb-4">
        {points.map((point) => (
          <li key={point} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            {point}
          </li>
        ))}
      </ul>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={showError && !checked}
          className="mt-0.5"
        />
        <span className="text-sm font-medium text-teal-950 leading-relaxed">
          {t.rich("checkbox", {
            link: (chunks) => (
              <Link
                href={ROUTES.LISTING_TERMS}
                target="_blank"
                className="font-semibold text-teal-800 underline underline-offset-2 hover:text-amber-600"
                onClick={(e) => e.stopPropagation()}
              >
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>

      {showError && !checked && <p className="mt-2 text-xs font-medium text-red-600">{t("required")}</p>}
    </div>
  );
}
