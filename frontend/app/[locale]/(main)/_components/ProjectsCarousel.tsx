"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProjectCard from "@/components/shared/ProjectCard";
import { useProjects } from "@/lib/hooks/useProjects";
import { ROUTES } from "@/lib/constants/routes";

export default function ProjectsCarousel() {
  const t = useTranslations("projects");
  const locale = useLocale();
  const { data, isLoading, error } = useProjects({ page: 1, limit: 8, lang: locale });
  const projects = data?.data ?? [];

  if (isLoading || error || projects.length === 0) return null;

  return (
    <div className="py-12 px-6 md:px-12 lg:px-16 xl:px-20 bg-teal-950">
      <div className="flex justify-between items-center px-4 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-400">{t("home.title")}</h2>
          <p className="text-sm text-amber-100/60 mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href={ROUTES.PROJECTS}
          className="text-sm sm:text-base font-semibold text-amber-200 hover:text-amber-400 whitespace-nowrap hover:underline decoration-amber-400 decoration-2 underline-offset-4"
        >
          {t("home.seeAll")} →
        </Link>
      </div>
      <Carousel opts={{ align: "start", loop: projects.length > 4 }} className="w-full mt-6">
        <CarouselContent className="my-4">
          {projects.map((project) => (
            <CarouselItem key={project.id} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 mx-1">
              <div className="h-full">
                <ProjectCard project={project} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12 bg-white/10 border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-teal-950" />
        <CarouselNext className="hidden md:flex -right-12 bg-white/10 border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-teal-950" />
      </Carousel>
    </div>
  );
}
