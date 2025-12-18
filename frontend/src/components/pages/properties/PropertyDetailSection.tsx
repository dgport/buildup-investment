import type { Property } from '@/lib/types/properties'
import {
  Square,
  Home,
  Bed,
  Bath,
  Layers,
  ArrowUpDown,
  Ruler,
} from 'lucide-react'

export function PropertyDetailsSection({ property }: { property: Property }) {
  const hasDetails = Boolean(
    property.totalArea ||
      property.rooms ||
      property.bedrooms ||
      property.bathrooms ||
      property.floors ||
      property.floorsTotal ||
      property.ceilingHeight ||
      property.balconyArea
  )

  if (!hasDetails) return null

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">
        Property Details
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {property.totalArea && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Square className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Total Area</p>
              <p className="text-xs md:text-sm font-semibold">
                {property.totalArea} m²
              </p>
            </div>
          </div>
        )}
        {property.rooms && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Home className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Rooms</p>
              <p className="text-xs md:text-sm font-semibold">
                {property.rooms}
              </p>
            </div>
          </div>
        )}
        {property.bedrooms && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Bed className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Bedrooms</p>
              <p className="text-xs md:text-sm font-semibold">
                {property.bedrooms}
              </p>
            </div>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Bath className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Bathrooms</p>
              <p className="text-xs md:text-sm font-semibold">
                {property.bathrooms}
              </p>
            </div>
          </div>
        )}
        {property.floors && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Layers className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Floor</p>
              <p className="text-xs md:text-sm font-semibold">
                {property.floors}
              </p>
            </div>
          </div>
        )}
        {property.floorsTotal && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <ArrowUpDown className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">
                Total Floors
              </p>
              <p className="text-xs md:text-sm font-semibold">
                {property.floorsTotal}
              </p>
            </div>
          </div>
        )}
        {property.ceilingHeight && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Ruler className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">
                Ceiling Height
              </p>
              <p className="text-xs md:text-sm font-semibold">
                {property.ceilingHeight} m
              </p>
            </div>
          </div>
        )}
        {property.balconyArea && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Square className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">
                Balcony Area
              </p>
              <p className="text-xs md:text-sm font-semibold">
                {property.balconyArea} m²
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
