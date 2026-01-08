import { useState } from 'react'
import { Plus, Building2, DollarSign, MapPin, Calendar } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useMyProperties, useDeleteProperty } from '@/lib/hooks/useProperties'
import { useCurrentUser } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination/Pagination'
import { Badge } from '@/components/ui/badge'
import type { Property } from '@/lib/types/properties'
import { CreateProperty } from '@/components/pages/admin/properties/CreateProperty'
import { EditProperty } from '@/components/pages/admin/properties/EditProperty'

const PROPERTIES_PER_PAGE = 9

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'REJECTED':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getDealTypeColor = (dealType: string) => {
  switch (dealType) {
    case 'SALE':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'RENT':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'DAILY_RENT':
      return 'bg-pink-100 text-pink-700 border-pink-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const formatDealType = (dealType: string) => {
  switch (dealType) {
    case 'SALE':
      return 'For Sale'
    case 'RENT':
      return 'For Rent'
    case 'DAILY_RENT':
      return 'Daily Rent'
    default:
      return dealType
  }
}

const formatPropertyType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Dashboard() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: user } = useCurrentUser()
  const page = parseInt(searchParams.get('page') || '1', 10)

  // ✅ This hook already calls /properties/my-properties endpoint
  // which should be filtered by userId on the backend
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useMyProperties({
    page,
    limit: PROPERTIES_PER_PAGE,
  })

  const deleteProperty = useDeleteProperty()

  const properties = propertiesResponse?.data || []
  const meta = propertiesResponse?.meta

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property)
    setView('edit')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?'))
      return

    try {
      await deleteProperty.mutateAsync(id)
      if (properties.length === 1 && page > 1) {
        handlePageChange(page - 1)
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete property'
      )
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedProperty(null)
  }

  if (view === 'create')
    return <CreateProperty onBack={handleBack} onSuccess={handleBack} />

  if (view === 'edit' && selectedProperty)
    return (
      <EditProperty
        property={selectedProperty}
        onBack={handleBack}
        onSuccess={handleBack}
      />
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Properties
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstname} {user?.lastname}
              </p>
            </div>
            <Button
              onClick={() => setView('create')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Property
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {meta?.total || 0}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {properties.filter(p => p.status === 'APPROVED').length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {properties.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-medium">
              Error loading properties. Please try again.
            </p>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map(property => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {property.galleryImages?.[0] ? (
                      <img
                        src={property.galleryImages[0].imageUrl}
                        alt={property.translation?.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="w-16 h-16 text-gray-300" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`${getStatusColor(property.status)} font-medium`}
                      >
                        {property.status}
                      </Badge>
                    </div>

                    {/* Hot Sale Badge */}
                    {property.hotSale && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500 text-white border-red-600">
                          🔥 Hot Sale
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                        {property.translation?.title || 'Untitled Property'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">
                          {property.translation?.address ||
                            property.location ||
                            'Location not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={getDealTypeColor(property.dealType)}>
                        {formatDealType(property.dealType)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatPropertyType(property.propertyType)}
                      </Badge>
                      {property.totalArea && (
                        <Badge variant="outline" className="text-xs">
                          {property.totalArea}m²
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    {property.price && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${property.price.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Property Features */}
                    {(property.rooms ||
                      property.bedrooms ||
                      property.bathrooms) && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                        {property.rooms && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{property.rooms} rooms</span>
                          </div>
                        )}
                        {property.bedrooms && (
                          <span>{property.bedrooms} beds</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} baths</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                        className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        Delete
                      </Button>
                    </div>

                    {/* Rejection Reason */}
                    {property.status === 'REJECTED' &&
                      property.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs font-medium text-red-700 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-xs text-red-600">
                            {property.rejectionReason}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages}
                  hasNextPage={meta.hasNextPage}
                  hasPreviousPage={meta.hasPreviousPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 rounded-full p-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first property listing
                </p>
                <Button
                  onClick={() => setView('create')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Property
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
