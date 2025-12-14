import PropertyCard from '@/components/pages/properties/PropertyCard'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProperties } from '@/lib/hooks/useProperties'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PropertyFilters as PropertyFiltersType } from '@/lib/types/properties'
import { PropertyFilters } from '@/components/pages/properties/PropertFilter'

export default function Properties() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const limit = 12

  // Build filters from URL params
  const buildFiltersFromParams = (): PropertyFiltersType => {
    const filters: PropertyFiltersType = {
      page,
      limit,
      lang: i18n.language,
      public: true,
    }

    // Property ID search
    const externalId = searchParams.get('externalId')
    if (externalId) filters.externalId = externalId

    // Property Type
    const propertyType = searchParams.get('propertyType')
    if (propertyType) filters.propertyType = propertyType

    // Deal Type
    const dealType = searchParams.get('dealType')
    if (dealType) filters.dealType = dealType

    // City
    const city = searchParams.get('city')
    if (city) filters.city = city

    // Price range
    const priceFrom = searchParams.get('priceFrom')
    if (priceFrom) filters.priceFrom = parseInt(priceFrom)

    const priceTo = searchParams.get('priceTo')
    if (priceTo) filters.priceTo = parseInt(priceTo)

    // Area range
    const areaFrom = searchParams.get('areaFrom')
    if (areaFrom) filters.areaFrom = parseInt(areaFrom)

    const areaTo = searchParams.get('areaTo')
    if (areaTo) filters.areaTo = parseInt(areaTo)

    // Room counts
    const rooms = searchParams.get('rooms')
    if (rooms) filters.rooms = parseInt(rooms)

    const bedrooms = searchParams.get('bedrooms')
    if (bedrooms) filters.bedrooms = parseInt(bedrooms)

    return filters
  }

  const filters = buildFiltersFromParams()
  const { data, isLoading, error } = useProperties(filters)

  // Reset to page 1 when filters change
  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      setPage(parseInt(pageParam))
    } else {
      setPage(1)
    }
  }, [searchParams])

  const transformedProperties =
    data?.data.map(property => ({
      id: property.id,
      externalId: property.externalId,
      image: property.galleryImages?.[0]?.imageUrl
        ? property.galleryImages[0].imageUrl
        : 'https://via.placeholder.com/800x600?text=No+Image',
      galleryImages: property.galleryImages,
      priceUSD: property.price ?? null,
      priceGEL: property.price ? property.price * 2.8 : 0,
      location: property.address,
      floors: property.floors ?? 0,
      rooms: property.rooms ?? 0,
      bedrooms: property.bedrooms ?? 0,
      dateAdded: property.createdAt,
      title: property.translation?.title ?? 'Untitled Property',
      totalArea: property.totalArea ?? null,
      propertyType: property.propertyType,
      status: property.status,
    })) || []

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {t('properties.errorTitle', {
              defaultValue: 'Error Loading Properties',
            })}
          </h2>
          <p className="text-gray-600">
            {error instanceof Error
              ? error.message
              : t('properties.errorMessage', {
                  defaultValue: 'Something went wrong',
                })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-28 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('properties.title', { defaultValue: 'Properties' })}
          </h1>

          {/* Filter Component */}
          <PropertyFilters />

          {data?.meta && (
            <p className="text-sm text-gray-500 mt-4">
              {t('properties.showing', {
                defaultValue: 'Showing {{count}} of {{total}} properties',
                count: data.data.length,
                total: data.meta.total,
              })}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : transformedProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {t('properties.noProperties', {
                defaultValue: 'No properties found',
              })}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t('properties.tryAdjusting', {
                defaultValue: 'Try adjusting your filters',
              })}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {transformedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.meta.hasPreviousPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  {t('pagination.previous', { defaultValue: 'Previous' })}
                </button>
                <span className="text-gray-600">
                  {t('pagination.pageInfo', {
                    defaultValue: 'Page {{current}} of {{total}}',
                    current: page,
                    total: data.meta.totalPages,
                  })}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  {t('pagination.next', { defaultValue: 'Next' })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
