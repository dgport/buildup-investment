"use client";

import { PageLoader } from "@/components/shared/PageLoader";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Building2, Globe, Phone } from "lucide-react";
import { useDevelopers } from "@/lib/hooks/useProjects";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { ROUTES } from "@/lib/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

export function DevelopersContent() {
  const t = useTranslations("projects.developers");
  const locale = useLocale();
  const { data: developers = [], isLoading } = useDevelopers(locale);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-28 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-900 rounded-xl p-2">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-teal-950">{t("title")}</h1>
        </div>
        <p className="text-teal-800/70 ml-14 mb-8">{t("subtitle")}</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 flex gap-4">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : developers.length === 0 ? (
          <p className="text-gray-500 py-16 text-center">{t("empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {developers.map((dev) => {
              const logo = resolveImageUrl(dev.logo);
              return (
                <Link
                  key={dev.id}
                  href={ROUTES.DEVELOPER(dev.slug)}
                  className="group card card-hover p-5 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={dev.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <span className="text-2xl font-black text-teal-800">{dev.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-teal-950 text-lg leading-tight group-hover:text-amber-600 transition-colors truncate">
                      {dev.name}
                    </h2>
                    <p className="text-xs text-teal-700/70 mt-0.5">
                      {t("projectsCount", { count: dev.projectsCount })}
                      {dev.foundedYear ? ` · ${t("founded", { year: dev.foundedYear })}` : ""}
                    </p>
                    {dev.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">{dev.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-teal-800">
                      {dev.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{dev.phone}</span>}
                      {dev.website && <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" />{dev.website.replace(/^https?:\/\//, "")}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
