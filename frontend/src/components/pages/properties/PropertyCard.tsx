import { Calendar, MapPin, Square, Sofa } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

interface PropertyCardProps {
  property: {
    id: string
    image: string
    priceUSD: number | null
    priceGEL: number
    location: string
    rooms: number
    bedrooms: number
    dateAdded: string
    title: string
    totalArea: number | null
    propertyType: string
    status: string
    floors?: number
  }
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<'USD' | 'GEL'>('USD')

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}/${day}/${year}`
  }

  const imageUrl = property.image
    ? `${import.meta.env.VITE_API_IMAGE_URL}/${property.image}`
    : undefined

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-300 transition-all duration-300 h-full cursor-pointer hover:shadow-lg"
    >
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden rounded-t-xl">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Price Section */}
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">
              {property.priceUSD ? (
                <>
                  {currency === 'USD' ? '$' : '₾'}
                  {currency === 'USD'
                    ? property.priceUSD.toLocaleString()
                    : Math.round(property.priceUSD * 2.8).toLocaleString()}
                </>
              ) : (
                'Price on request'
              )}
            </h3>

            {/* Currency Toggle Switch */}
            <div
              className="flex items-center gap-2"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-xs font-medium text-gray-600">$</span>
              <Switch
                checked={currency === 'GEL'}
                onCheckedChange={checked =>
                  setCurrency(checked ? 'GEL' : 'USD')
                }
              />
              <span className="text-xs font-medium text-gray-600">₾</span>
            </div>

            {/* Price per m² */}
            {property.priceUSD && property.totalArea && (
              <span className="text-sm text-gray-500">
                {currency === 'USD' ? '$' : '₾'}{' '}
                {currency === 'USD'
                  ? Math.round(property.priceUSD / property.totalArea)
                  : Math.round(
                      (property.priceUSD * 2.8) / property.totalArea
                    )}{' '}
                / m²
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-blue-900 transition-colors line-clamp-1">
            {property.title}
          </h4>

          {/* Address */}
          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* Property Details Icons */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            {property.rooms > 0 && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Sofa className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Rooms: {property.rooms}
                </span>
              </div>
            )}

            {property.totalArea && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Square className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Area: {property.totalArea} m²
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-gray-500 ml-auto">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(property.dateAdded)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard
