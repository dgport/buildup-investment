// components/PropertyFilters.tsx
import { useProperties } from '@/lib/hooks/useProperties'
import { DealType, PropertyStatus, PropertyType, type PropertyFilters } from '@/lib/types/properties'
import React, { useState } from 'react'
import PropertyCard from './PropertyCard'
 

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFilters) => void
  initialFilters?: PropertyFilters
}

export const PropertyFiltersComponent: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters)

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Filters</h3>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Property Type</label>
        <select
          value={filters.propertyType || ''}
          onChange={e =>
            handleFilterChange('propertyType', e.target.value || undefined)
          }
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">All Types</option>
          {Object.values(PropertyType).map(type => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Deal Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Deal Type</label>
        <select
          value={filters.dealType || ''}
          onChange={e =>
            handleFilterChange('dealType', e.target.value || undefined)
          }
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">All Deals</option>
          {Object.values(DealType).map(type => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <input
          type="text"
          value={filters.address || ''}
          onChange={e =>
            handleFilterChange('address', e.target.value || undefined)
          }
          placeholder="Search by address..."
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-2">Price From</label>
          <input
            type="number"
            value={filters.priceFrom || ''}
            onChange={e =>
              handleFilterChange(
                'priceFrom',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Min price"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Price To</label>
          <input
            type="number"
            value={filters.priceTo || ''}
            onChange={e =>
              handleFilterChange(
                'priceTo',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Max price"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Area Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-2">
            Area From (m²)
          </label>
          <input
            type="number"
            value={filters.areaFrom || ''}
            onChange={e =>
              handleFilterChange(
                'areaFrom',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Min area"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Area To (m²)</label>
          <input
            type="number"
            value={filters.areaTo || ''}
            onChange={e =>
              handleFilterChange(
                'areaTo',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Max area"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium mb-2">Rooms</label>
          <select
            value={filters.rooms || ''}
            onChange={e =>
              handleFilterChange(
                'rooms',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <select
            value={filters.bedrooms || ''}
            onChange={e =>
              handleFilterChange(
                'bedrooms',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bathrooms</label>
          <select
            value={filters.bathrooms || ''}
            onChange={e =>
              handleFilterChange(
                'bathrooms',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3+</option>
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Property Status
        </label>
        <select
          value={filters.status || ''}
          onChange={e =>
            handleFilterChange('status', e.target.value || undefined)
          }
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          {Object.values(PropertyStatus).map(status => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Boolean Filters */}
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-2">Amenities</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hotSale || false}
              onChange={e =>
                handleFilterChange('hotSale', e.target.checked || undefined)
              }
              className="mr-2"
            />
            <span className="text-sm">Hot Sale</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasFurniture || false}
              onChange={e =>
                handleFilterChange(
                  'hasFurniture',
                  e.target.checked || undefined
                )
              }
              className="mr-2"
            />
            <span className="text-sm">Furnished</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasBalcony || false}
              onChange={e =>
                handleFilterChange('hasBalcony', e.target.checked || undefined)
              }
              className="mr-2"
            />
            <span className="text-sm">Balcony</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasConditioner || false}
              onChange={e =>
                handleFilterChange(
                  'hasConditioner',
                  e.target.checked || undefined
                )
              }
              className="mr-2"
            />
            <span className="text-sm">Air Conditioner</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasInternet || false}
              onChange={e =>
                handleFilterChange('hasInternet', e.target.checked || undefined)
              }
              className="mr-2"
            />
            <span className="text-sm">Internet</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasNaturalGas || false}
              onChange={e =>
                handleFilterChange(
                  'hasNaturalGas',
                  e.target.checked || undefined
                )
              }
              className="mr-2"
            />
            <span className="text-sm">Natural Gas</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  )
}

// Example usage in a page component
export const PropertiesPage = () => {
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
  })

  const { data, isLoading } = useProperties(filters)

  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters({ ...newFilters, page: 1 }) // Reset to page 1 when filters change
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PropertyFiltersComponent
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>

        {/* Properties Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <p className="text-gray-600">Found {data?.meta.total} properties</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.data.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={!data.meta.hasPreviousPage}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={!data.meta.hasNextPage}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
