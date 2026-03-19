"use client";

import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";
import PropertyCard from "@/components/shared/PropertyCard";

// Temporary Mock Data
const MOCK_PROPERTIES = [
  {
    id: "1",
    externalId: "RE-2024-001",
    image: "property-1.jpg", // Ensure these paths work or use placeholder URLs
    galleryImages: [
      { imageUrl: "property-1.jpg", order: 1 },
      { imageUrl: "property-2.jpg", order: 2 },
    ],
    priceUSD: 125000,
    priceGEL: 350000,
    regionName: "Vake, Tbilisi",
    rooms: 3,
    title: "Luxury Apartment with City View",
    totalArea: 85,
    propertyType: "APARTMENT",
    hotSale: true,
    dateAdded: new Date().toISOString(),
  },
  {
    id: "2",
    externalId: "RE-2024-002",
    image: "property-2.jpg",
    priceUSD: 89000,
    priceGEL: 249200,
    regionName: "Saburtalo, Tbilisi",
    rooms: 2,
    title: "Modern Studio near Metro",
    totalArea: 45,
    propertyType: "APARTMENT",
    hotSale: false,
    dateAdded: new Date().toISOString(),
  },
  {
    id: "3",
    externalId: "RE-2024-003",
    image: "property-3.jpg",
    priceUSD: 210000,
    priceGEL: 588000,
    regionName: "Batumi, Adjara",
    rooms: 4,
    title: "Seaside Villa with Garden",
    totalArea: 150,
    propertyType: "VILLA",
    hotSale: true,
    dateAdded: new Date().toISOString(),
  },
  {
    id: "4",
    externalId: "RE-2024-004",
    image: "property-4.jpg",
    priceUSD: 155000,
    priceGEL: 434000,
    regionName: "Old Tbilisi",
    rooms: 3,
    title: "Authentic Renovated House",
    totalArea: 110,
    propertyType: "HOUSE",
    hotSale: false,
    dateAdded: new Date().toISOString(),
  },
];

const PropertyCarousel = () => {
  const t = useTranslations("main");

  // In the future, you will replace 'MOCK_PROPERTIES' with your hook data
  const properties = MOCK_PROPERTIES;

  if (properties.length === 0) return null;

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
                {/* Note: The Link is already handled inside the PropertyCard via router.push 
                   or you can keep it here. I've added padding (p-2) to the item for spacing.
                */}
                <div className="h-full transform transition-transform duration-300 hover:-translate-y-1">
                  <PropertyCard property={property as any} />
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
