"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslations, useLocale } from "next-intl";
import PropertyCard from "@/components/shared/PropertyCard";
import { useProperties } from "@/lib/hooks/useProperties";

const PropertyCarousel = () => {
  const t = useTranslations("main");
  const locale = useLocale();

  const {
    data: response,
    isLoading,
    error,
  } = useProperties({
    page: 1,
    limit: 8,
    lang: locale,
  });

  const properties = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="py-12 px-6 md:px-12 lg:px-16 xl:px-28 bg-[#FAFAF8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || properties.length === 0) return null;

  return (
    <div className="py-12 px-6 md:px-12 lg:px-16 xl:px-28 bg-[#FAFAF8]">
      <div className="w-full">
        <div className="flex justify-between items-center px-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">
            {t("featuredProperties")}
          </h1>
          <Link
            href="/properties"
            className="text-sm sm:text-base font-semibold text-teal-700 hover:text-amber-600 transition-colors whitespace-nowrap hover:underline decoration-amber-400 decoration-2 underline-offset-4"
          >
            {t("seeAll")} →
          </Link>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full mt-8">
          <CarouselContent className="my-7">
            {properties.map((property) => (
              <CarouselItem
                key={property.id}
                className="cursor-default basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2"
              >
                <div className="h-full transform transition-transform duration-300 hover:-translate-y-1">
                  <PropertyCard
                    property={{
                      id: property.id,
                      externalId: property.externalId,
                      galleryImages: property.galleryImages,
                      priceUSD: property.price,
                      regionName: property.regionName,
                      rooms: property.rooms ?? undefined,
                      title: property.translation?.title ?? "",
                      totalArea: property.totalArea,
                      hotSale: property.hotSale,
                      dateAdded: property.createdAt,
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex cursor-pointer -left-12" />
          <CarouselNext className="hidden md:flex cursor-pointer -right-12" />
        </Carousel>
      </div>
    </div>
  );
};

export default PropertyCarousel;
