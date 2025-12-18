import PropertyCard from '@/components/pages/properties/PropertyCard'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useProperties } from '@/lib/hooks/useProperties'
import { PropertyFilters } from '@/components/pages/properties/PropertFilter'
import { Pagination } from '@/components/shared/pagination/Pagination'
import { Region } from '@/lib/types/properties'
import { LoadingOverlay } from '@/components/shared/loaders/LoadingOverlay'
import IsError from '@/components/shared/loaders/IsError'

export default function Properties() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const externalId = searchParams.get('externalId') || undefined
  const regionParam = searchParams.get('region')
  const propertyType = searchParams.get('propertyType') || undefined
  const dealType = searchParams.get('dealType') || undefined
  const priceFrom = searchParams.get('priceFrom')
    ? parseInt(searchParams.get('priceFrom')!)
    : undefined
  const priceTo = searchParams.get('priceTo')
    ? parseInt(searchParams.get('priceTo')!)
    : undefined
  const areaFrom = searchParams.get('areaFrom')
    ? parseInt(searchParams.get('areaFrom')!)
    : undefined
  const areaTo = searchParams.get('areaTo')
    ? parseInt(searchParams.get('areaTo')!)
    : undefined
  const rooms = searchParams.get('rooms')
    ? parseInt(searchParams.get('rooms')!)
    : undefined
  const bedrooms = searchParams.get('bedrooms')
    ? parseInt(searchParams.get('bedrooms')!)
    : undefined

  const region =
    regionParam && regionParam in Region ? (regionParam as Region) : undefined

  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useProperties({
    lang: i18n.language,
    page: page,
    limit: 12,
    externalId,
    region,
    propertyType,
    dealType,
    priceFrom,
    priceTo,
    areaFrom,
    areaTo,
    rooms,
    bedrooms,
  })

  const properties = propertiesResponse?.data || []
  const meta = propertiesResponse?.meta

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />
  }

  if (error) {
    return <IsError />
  }

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 xl:px-28 py-10">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('properties.title')}
          </h1>
          {meta && (
            <p className="text-gray-600">
              {t('properties.totalProperties', {
                count: meta.total,
                defaultValue: `${meta.total} properties`,
              })}
            </p>
          )}
        </div>

        <div className="mb-4">
          <PropertyFilters />
        </div>

        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 mb-4">
              {properties.map(property => (
                <Link key={property.id} to={`/properties/${property.id}`}>
                  <PropertyCard
                    property={{
                      id: property.id,
                      externalId: property.externalId,
                      image: property.galleryImages?.[0]?.imageUrl
                        ? property.galleryImages[0].imageUrl
                        : 'https://via.placeholder.com/800x600?text=No+Image',
                      galleryImages: property.galleryImages,
                      priceUSD: property.price ?? null,
                      priceGEL: property.price ? property.price * 2.8 : 0,
                      rooms: property.rooms ?? 0,
                      dateAdded: property.createdAt,
                      title: property.translation?.title ?? 'Untitled Property',
                      totalArea: property.totalArea ?? null,
                      propertyType: property.propertyType,
                      hotSale: property.hotSale,
                      regionName: property.regionName,
                    }}
                  />
                </Link>
              ))}
            </div>

            {meta && (
              <div className="flex justify-center mt-20 md:mt-28 pb-8">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {t('properties.noProperties')}
            </p>
            <p className="text-gray-400 text-sm">
              {t('properties.tryDifferentFilters', {
                defaultValue: 'Try adjusting your filters',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
