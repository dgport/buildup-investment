"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealType, PropertyType, Region } from "@/lib/types/properties";
import { useProperties } from "@/lib/hooks/useProperties";
import { useProjects, useDevelopers } from "@/lib/hooks/useProjects";
import { ROUTES } from "@/lib/constants/routes";

const ANY = "any";

/** Quick search bar shown inside the home hero; lands on /properties with filters. */
export default function HeroSearch() {
  const t = useTranslations("main.hero");
  const tp = useTranslations("properties");
  const locale = useLocale();
  const router = useRouter();
  const [dealType, setDealType] = useState(ANY);
  const [propertyType, setPropertyType] = useState(ANY);
  const [region, setRegion] = useState(ANY);

  const { data: listings } = useProperties({ page: 1, limit: 1, lang: locale });
  const { data: projects } = useProjects({ page: 1, limit: 1, lang: locale });
  const { data: developers } = useDevelopers(locale);

  const submit = () => {
    const params = new URLSearchParams({ page: "1" });
    if (dealType !== ANY) params.set("dealType", dealType);
    if (propertyType !== ANY) params.set("propertyType", propertyType);
    if (region !== ANY) params.set("region", region);
    router.push(`${ROUTES.PROPERTIES}?${params.toString()}`);
  };

  const trigger =
    "h-12 w-full rounded-xl border-0 bg-white/95 text-teal-950 font-medium shadow-none focus:ring-2 focus:ring-amber-400";

  const stats = [
    { value: listings?.meta.total, label: t("listings") },
    { value: projects?.meta.total, label: t("projects") },
    { value: developers?.length, label: t("developers") },
  ].filter((s) => typeof s.value === "number" && s.value > 0);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 sm:mt-24 px-2 sm:px-0">
      <p className="text-amber-100/80 text-sm sm:text-base font-medium mb-3 text-center">
        {t("searchTitle")}
      </p>
      <div className="bg-teal-950/70 backdrop-blur-md border border-amber-400/30 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-black/30">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger className={trigger} aria-label={t("dealType")}>
              <SelectValue placeholder={t("dealType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("dealType")}: {t("any")}</SelectItem>
              {Object.values(DealType).map((d) => (
                <SelectItem key={d} value={d}>{tp(`enums.dealType.${d}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className={trigger} aria-label={t("propertyType")}>
              <SelectValue placeholder={t("propertyType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("propertyType")}: {t("any")}</SelectItem>
              {Object.values(PropertyType).map((p) => (
                <SelectItem key={p} value={p}>{tp(`enums.propertyType.${p}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className={trigger} aria-label={t("region")}>
              <SelectValue placeholder={t("region")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("region")}: {t("any")}</SelectItem>
              {Object.values(Region).map((r) => (
                <SelectItem key={r} value={r}>{tp(`enums.region.${r}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={submit}
            className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-400/25"
          >
            <Search className="w-4 h-4" />
            {t("search")}
          </button>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-5">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{s.value}</span>
              <span className="ml-2 text-xs sm:text-sm uppercase tracking-widest text-amber-100/70">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
