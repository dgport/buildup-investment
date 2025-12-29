import { Link } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import PropertyCard from '../properties/PropertyCard'
import { useProperties } from '@/lib/hooks/useProperties'
import { useTranslation } from 'react-i18next'
import IsError from '@/components/shared/loaders/IsError'
import { LoadingOverlay } from '@/components/shared/loaders/LoadingOverlay'

const PropertyCarousel = () => {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useProperties({
    page: 1,
    limit: 12,
    lang: i18n.language,
  })

  const transformProperty = (property: any) => ({
    id: property.id,
    externalId: property.externalId,
    image: property.galleryImages?.[0]?.imageUrl || '/placeholder-property.jpg',
    galleryImages: property.galleryImages,
    priceUSD: property.price,
    priceGEL: property.price ? Math.round(property.price * 2.8) : 0,
    rooms: property.rooms || null,
    dateAdded: property.createdAt,
    title:
      property.translation?.title ||
      property.translations?.[0]?.title ||
      'Untitled Property',
    totalArea: property.totalArea,
    propertyType: property.propertyType,
    status: property.status,
    hotSale: property.hotSale,
    regionName: property.regionName,
  })

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />
  }

  if (isError) {
    return <IsError />
  }

  const properties = data?.data?.map(transformProperty) || []

  if (properties.length === 0) return null

  return (
    <div className="py-12 px-6 md:px-12 lg:px-16 xl:px-28 bg-[#FAFAF8]">
      <div className="w-full">
        <div className="flex justify-between items-center px-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">
            {t('home.featuredProperties')}
          </h1>
          <Link
            to="/properties"
            className="text-sm sm:text-base font-semibold text-teal-700 hover:text-amber-600 transition-colors whitespace-nowrap hover:underline decoration-amber-400 decoration-2 underline-offset-4"
          >
            {t('home.seeAll')} →
          </Link>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full mt-8">
          <CarouselContent className="my-7">
            {properties.map(property => (
              <CarouselItem
                key={property.id}
                className="cursor-default basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Link
                  to={`/properties/${property.id}`}
                  className="block h-full"
                >
                  <div className="h-full rounded-xl overflow-hidden border-2 border-teal-200 hover:border-amber-400 shadow-lg hover:shadow-2xl hover:shadow-teal-200/50 transition-all duration-300 bg-white transform hover:-translate-y-1">
                    <PropertyCard property={property} />
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="md:flex cursor-pointer" />
          <CarouselNext className="md:flex cursor-pointer" />
        </Carousel>
      </div>
    </div>
  )
}

export default PropertyCarousel
