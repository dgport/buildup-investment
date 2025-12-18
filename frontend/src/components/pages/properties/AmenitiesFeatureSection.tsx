import type { Property } from '@/lib/types/properties'
import { CheckCircle2 } from 'lucide-react'

interface AmenitiesFeaturesSectionProps {
  property: Property
}

export function AmenitiesFeaturesSection({
  property,
}: AmenitiesFeaturesSectionProps) {
  const amenities = [
    { key: 'hasConditioner', label: 'Air Conditioner' },
    { key: 'hasFurniture', label: 'Furniture' },
    { key: 'hasBed', label: 'Bed' },
    { key: 'hasSofa', label: 'Sofa' },
    { key: 'hasTable', label: 'Table' },
    { key: 'hasChairs', label: 'Chairs' },
    { key: 'hasStove', label: 'Stove' },
    { key: 'hasRefrigerator', label: 'Refrigerator' },
    { key: 'hasOven', label: 'Oven' },
    { key: 'hasWashingMachine', label: 'Washing Machine' },
    { key: 'hasKitchenAppliances', label: 'Kitchen Appliances' },
    { key: 'hasBalcony', label: 'Balcony' },
    { key: 'hasNaturalGas', label: 'Natural Gas' },
    { key: 'hasInternet', label: 'Internet' },
    { key: 'hasTV', label: 'TV' },
    { key: 'hasSewerage', label: 'Sewerage' },
    { key: 'isFenced', label: 'Fenced' },
    { key: 'hasYardLighting', label: 'Yard Lighting' },
    { key: 'hasGrill', label: 'Grill' },
    { key: 'hasAlarm', label: 'Alarm' },
    { key: 'hasVentilation', label: 'Ventilation' },
    { key: 'hasWater', label: 'Water' },
    { key: 'hasElectricity', label: 'Electricity' },
    { key: 'hasGate', label: 'Gate' },
  ]

  const availableAmenities = amenities.filter(
    amenity => property[amenity.key as keyof Property] === true
  )

  if (availableAmenities.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">
        Amenities & Features
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
        {availableAmenities.map(amenity => (
          <div
            key={amenity.key}
            className="flex items-center gap-1.5 md:gap-2 text-green-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="text-xs md:text-sm">{amenity.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
