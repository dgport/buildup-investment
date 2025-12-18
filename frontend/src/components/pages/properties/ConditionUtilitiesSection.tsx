import type { Property } from '@/lib/types/properties'
import { Thermometer, Droplet, Car } from 'lucide-react'

interface ConditionUtilitiesSectionProps {
  property: Property
}

const formatEnumValue = (value: string | null): string => {
  if (!value) return 'N/A'
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function ConditionUtilitiesSection({
  property,
}: ConditionUtilitiesSectionProps) {
  const hasContent = Boolean(
    property.occupancy ||
      property.heating ||
      property.hotWater ||
      property.parking ||
      property.isNonStandard
  )

  if (!hasContent) return null

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">
        Condition & Utilities
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {property.occupancy && (
          <div className="p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-500 mb-0.5">
              Occupancy
            </p>
            <p className="text-xs md:text-sm font-semibold">
              {formatEnumValue(property.occupancy)}
            </p>
          </div>
        )}
        {property.heating && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Thermometer className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Heating</p>
              <p className="text-xs md:text-sm font-semibold truncate">
                {formatEnumValue(property.heating)}
              </p>
            </div>
          </div>
        )}
        {property.hotWater && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Droplet className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Hot Water</p>
              <p className="text-xs md:text-sm font-semibold truncate">
                {formatEnumValue(property.hotWater)}
              </p>
            </div>
          </div>
        )}
        {property.parking && (
          <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-gray-50 rounded-lg">
            <Car className="w-4 h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-gray-500">Parking</p>
              <p className="text-xs md:text-sm font-semibold truncate">
                {formatEnumValue(property.parking)}
              </p>
            </div>
          </div>
        )}
        {property.isNonStandard && (
          <div className="p-2 md:p-2.5 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs md:text-sm font-semibold text-orange-700">
              Non-Standard Layout
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
