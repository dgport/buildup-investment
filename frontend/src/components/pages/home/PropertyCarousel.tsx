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

const PropertyCarousel = () => {
  // Fetch properties with pagination
  const { data, isLoading, isError } = useProperties({
    page: 1,
    limit: 12,
    lang: 'en',
  })

  // Transform API property to card format
  const transformProperty = (property: any) => ({
    id: property.id,
    image: property.galleryImages?.[0]?.imageUrl || '/placeholder-property.jpg',
    priceUSD: property.price,
    priceGEL: property.price ? Math.round(property.price * 2.8) : 0,
    location: property.address,
    rooms: property.rooms || 0,
    bedrooms: property.bedrooms || 0,
    dateAdded: property.createdAt,
    title:
      property.translation?.title ||
      property.translations?.[0]?.title ||
      'Untitled Property',
    totalArea: property.totalArea,
    propertyType: property.propertyType,
    status: property.status,
    floors: property.floors,
  })

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="w-full">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading properties...</div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8">
        <div className="w-full">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">Error loading properties</div>
          </div>
        </div>
      </div>
    )
  }

  const properties = data?.data?.map(transformProperty) || []

  if (properties.length === 0) {
    return null
  }

  return (
    <div className="py-8">
      <div className="w-full">
        <div className="flex justify-between items-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Featured Properties
          </h1>
          <Link
            to="/properties"
            className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            See All →
          </Link>
        </div>

        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          <CarouselContent className="my-7">
            {properties.map(property => (
              <CarouselItem
                key={property.id}
                className="cursor-default basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <Link to={`/properties/${property.id}`}>
                  <PropertyCard property={property} />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="md:flex bg-gray-100" />
          <CarouselNext className="md:flex bg-gray-100" />
        </Carousel>
      </div>
    </div>
  )
}

export default PropertyCarousel
