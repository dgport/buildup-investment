import PropertyCard from '@/components/pages/properties/PropertyCard'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProperties } from '@/lib/hooks/useProperties'
import { Loader2 } from 'lucide-react'
import { PropertyFilters } from '@/components/pages/properties/PropertyFilter'
 

type Currency = 'USD' | 'GEL'

export default function Properties() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const limit = 12

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchParams])

  // Build filter params from URL
  const filterParams = {
    page,
    limit,
    lang: 'en',
    propertyType: searchParams.get('propertyType') || undefined,
    status: searchParams.get('status') || undefined,
    priceFrom: searchParams.get('priceFrom')
      ? parseInt(searchParams.get('priceFrom')!)
      : undefined,
    priceTo: searchParams.get('priceTo')
      ? parseInt(searchParams.get('priceTo')!)
      : undefined,
    areaFrom: searchParams.get('areaFrom')
      ? parseInt(searchParams.get('areaFrom')!)
      : undefined,
    areaTo: searchParams.get('areaTo')
      ? parseInt(searchParams.get('areaTo')!)
      : undefined,
    rooms: searchParams.get('rooms')
      ? parseInt(searchParams.get('rooms')!)
      : undefined,
    bedrooms: searchParams.get('bedrooms')
      ? parseInt(searchParams.get('bedrooms')!)
      : undefined,
    bathrooms: searchParams.get('bathrooms')
      ? parseInt(searchParams.get('bathrooms')!)
      : undefined,
    floors: searchParams.get('floors')
      ? parseInt(searchParams.get('floors')!)
      : undefined,
    condition: searchParams.get('condition') || undefined,
    heating: searchParams.get('heating') || undefined,
    parking: searchParams.get('parking') || undefined,
    hasConditioner: searchParams.get('hasConditioner') === 'true' || undefined,
    hasFurniture: searchParams.get('hasFurniture') === 'true' || undefined,
    hasBalcony: searchParams.get('hasBalcony') === 'true' || undefined,
    hasInternet: searchParams.get('hasInternet') === 'true' || undefined,
    hasNaturalGas: searchParams.get('hasNaturalGas') === 'true' || undefined,
  }

  const { data, isLoading, error, refetch } = useProperties(filterParams)

  const formatPrice = (priceUSD: number | null): string => {
    if (!priceUSD) return 'Price on request'

    if (currency === 'USD') {
      return `$${priceUSD.toLocaleString()}`
    }
    // Convert USD to GEL (approximate rate: 1 USD = 2.8 GEL)
    const priceGEL = Math.round(priceUSD * 2.8)
    return `₾${priceGEL.toLocaleString()}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    )
  }

  // Transform API data to match PropertyCard interface
  const transformedProperties =
    data?.data.map(property => ({
      id: property.id,
      image: property.galleryImages?.[0]?.imageUrl
        ? `${import.meta.env.VITE_API_IMAGE_URL}/${property.galleryImages[0].imageUrl}`
        : 'https://via.placeholder.com/800x600?text=No+Image',
      priceUSD: property.price || 0,
      priceGEL: property.price ? property.price * 2.8 : 0,
      location: property.address,
      floor: property.floors || 0,
      rooms: property.rooms || 0,
      bedrooms: property.bedrooms || 0,
      dateAdded: property.createdAt,
      title: property.translation?.title || 'Untitled Property',
      totalArea: property.totalArea,
      propertyType: property.propertyType,
      status: property.status,
    })) || []

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Properties
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-28 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Properties
          </h1>
          <p className="text-gray-600">
            Explore our collection of premium properties
          </p>
          {data?.meta && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {data.data.length} of {data.meta.total} properties
            </p>
          )}
        </div>

        {/* Filter Component */}
        <PropertyFilters onFilterChange={() => refetch()} />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : transformedProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No properties found matching your criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {transformedProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  currency={currency}
                  setCurrency={setCurrency}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.meta.hasPreviousPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {data.meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.meta.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
