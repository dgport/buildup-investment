"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Globe, Mail, Phone } from "lucide-react";
import { useDeveloper, useProjects } from "@/lib/hooks/useProjects";
import { resolveImageUrl } from "@/lib/utils/image-utils";
import { ROUTES } from "@/lib/constants/routes";
import ProjectCard from "@/components/shared/ProjectCard";

export function DeveloperDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslations("projects.developers");
  const locale = useLocale();
  const { data: dev, isLoading, error } = useDeveloper(slug, locale);
  const { data: projects } = useProjects({ developer: slug, lang: locale, limit: 48 });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700" />
      </div>
    );
  }
  if (error || !dev) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  const logo = resolveImageUrl(dev.logo);
  const list = projects?.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <Link href={ROUTES.DEVELOPERS} className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-amber-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("title")}
        </Link>

        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 mb-10">
          <div className="w-28 h-28 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={dev.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-4xl font-black text-teal-800">{dev.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-teal-950">{dev.name}</h1>
            <p className="text-sm text-teal-700/70 mt-1">
              {t("projectsCount", { count: dev.projectsCount })}
              {dev.foundedYear ? ` · ${t("founded", { year: dev.foundedYear })}` : ""}
            </p>
            {dev.description && (
              <p className="text-gray-700 leading-relaxed mt-4 whitespace-pre-line">{dev.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-5">
              {dev.phone && (
                <a href={`tel:${dev.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 hover:border-amber-300">
                  <Phone className="w-4 h-4 text-amber-500" />{dev.phone}
                </a>
              )}
              {dev.email && (
                <a href={`mailto:${dev.email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 hover:border-amber-300">
                  <Mail className="w-4 h-4 text-amber-500" />{dev.email}
                </a>
              )}
              {dev.website && (
                <a href={dev.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 hover:border-amber-300">
                  <Globe className="w-4 h-4 text-amber-500" />{t("website")}
                </a>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-teal-950 mb-4">{t("projects")}</h2>
        {list.length === 0 ? (
          <p className="text-gray-500">{t("noProjects")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
