import { Switch } from '@/components/ui/switch'
import {
  ArrowUpRight,
  Bed,
  Calendar,
  Home,
  MapPin,
  Square,
  Sofa,
  Car,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

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
  currency: 'USD' | 'GEL'
  setCurrency: (currency: 'USD' | 'GEL') => void
  formatPrice: (priceUSD: number | null) => string
  formatDate: (date: string) => string
}

const PropertyCard = ({
  property,
  currency,
  setCurrency,
  formatPrice,
  formatDate,
}: PropertyCardProps) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-52">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Image Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Price Section */}
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-gray-900">
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

          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-green-500 text-white rounded-full px-2 py-1">
            <span className="text-xs font-medium">$</span>
          </div>

          {/* Price per m² */}
          {property.priceUSD && property.totalArea && (
            <span className="text-sm text-gray-500">
              $ {Math.round(property.priceUSD / property.totalArea)} / m²
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-gray-900 line-clamp-1">
          {property.title}
        </h4>

        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        {/* Property Details Icons */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          {property.rooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Sofa className="w-4 h-4" />
              <span className="text-sm font-medium">{property.rooms}</span>
            </div>
          )}

          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Bed className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
          )}

          {property.floors && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">{property.floors}</span>
            </div>
          )}

          {property.totalArea && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Square className="w-4 h-4" />
              <span className="text-sm font-medium">
                {property.totalArea} m²
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
  )
}

export default PropertyCard
