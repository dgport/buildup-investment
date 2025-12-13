import PropertyCard from '@/components/pages/properties/PropertyCard'
import { useState } from 'react'
import { useProperties } from '@/lib/hooks/useProperties'
import { Loader2 } from 'lucide-react'

type Currency = 'USD' | 'GEL'

export default function Properties() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [page, setPage] = useState(1)
  const limit = 12

  const baseParams = {
    page,
    limit,
    lang: 'en',
  }

  const { data, isLoading, error } = useProperties(baseParams)

  const formatPrice = (priceUSD: number | null): string => {
    if (!priceUSD) return 'Price on request'

    if (currency === 'USD') {
      return `$${priceUSD.toLocaleString()}`
    }
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
    <div className="min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-28 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Properties
          </h1>

          {data?.meta && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {data.data.length} of {data.meta.total} properties
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : transformedProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No properties found</p>
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
