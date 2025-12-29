import {
  Calendar,
  MapPin,
  Square,
  Sofa,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from 'react-i18next'

import type { PropertyType } from '@/lib/types/properties'
import { useCurrency } from '@/lib/context/CurrencyContext'

interface PropertyCardProps {
  property: {
    id: string
    externalId: string
    image?: string
    galleryImages?: Array<{ imageUrl: string; order?: number }>
    priceUSD: number | null
    priceGEL: number
    regionName?: string | null
    rooms?: number
    title: string
    totalArea?: number | null
    propertyType: PropertyType
    hotSale?: boolean
    dateAdded: string
  }
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currency, setCurrency, exchangeRate } = useCurrency()
  const [copied, setCopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const allImages =
    property.galleryImages && property.galleryImages.length > 0
      ? property.galleryImages.map(img => img.imageUrl)
      : property.image
        ? [property.image]
        : []

  const hasMultipleImages = allImages.length > 1

  const handleCardClick = () => navigate(`/properties/${property.id}`)

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(property.externalId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex(
      prev => (prev - 1 + allImages.length) % allImages.length
    )
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentImageIndex(prev => (prev + 1) % allImages.length)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`
  }

  const formatPrice = (priceUSD: number | null) => {
    if (!priceUSD) return t('home.priceOnRequest')
    return currency === 'USD'
      ? priceUSD.toLocaleString()
      : Math.round(priceUSD * exchangeRate).toLocaleString()
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border-2 border-teal-900/30 hover:border-amber-400/60 transition-all duration-300 h-ful  w-full cursor-pointer shadow-lg hover:shadow-2xl overflow-hidden"
    >
      <div className="relative h-68 overflow-hidden  bg-gray-100 border-b-2 border-teal-900/20">
        {allImages.length > 0 ? (
          <div className="relative h-full bg-gray-900">
            {allImages.map((img, index) => (
              <img
                key={index}
                src={`${import.meta.env.VITE_API_IMAGE_URL}/${img}`}
                alt={`${property.title} - Image ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-400/90 hover:bg-amber-400 rounded-full p-2 shadow-lg transition-all z-10 border border-amber-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-teal-950" />
                </button>
                <button
                  onClick={goToNext}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-400/90 hover:bg-amber-400 rounded-full p-2 shadow-lg transition-all z-10 border border-amber-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-teal-950" />
                </button>
                <div className="absolute top-2 left-2 bg-teal-950/80 backdrop-blur-sm text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full z-10 border border-amber-400/30">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">No image available</p>
          </div>
        )}

        {property.hotSale && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-20 animate-pulse border border-red-600">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {t('properties.hotSale', { defaultValue: 'Hot Sale' })}
            </span>
          </div>
        )}

        <div
          className="absolute bottom-2 right-2 bg-teal-950/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md flex items-center gap-1.5 z-20 border border-amber-400/30"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-xs text-amber-400 font-semibold">
            ID: {property.externalId}
          </div>
          <button
            onClick={handleCopyId}
            className="text-amber-400 hover:text-amber-300 transition-colors p-0.5"
            title="Copy ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-amber-400/20">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-teal-950">
                {formatPrice(property.priceUSD)}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-teal-800">$</span>
                <Switch
                  checked={currency === 'GEL'}
                  onCheckedChange={checked =>
                    setCurrency(checked ? 'GEL' : 'USD')
                  }
                />
                <span className="text-xs font-medium text-teal-800">₾</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-teal-800 text-sm whitespace-nowrap pt-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(property.dateAdded)}</span>
            </div>
          </div>

          <h4 className="text-sm sm:text-base text-teal-900 hover:text-amber-600 transition-colors line-clamp-1 font-semibold">
            {property.title}
          </h4>

          {property.regionName && (
            <div className="flex items-start gap-2 text-teal-800 text-sm pb-3 border-b border-teal-900/10">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <span className="line-clamp-1">{property.regionName}</span>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            {property.rooms && property.rooms > 0 && (
              <div className="flex items-center gap-1.5 text-teal-800">
                <Sofa className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">
                  {t('home.rooms')}: {property.rooms}
                </span>
              </div>
            )}
            {property.totalArea && (
              <div className="flex items-center gap-1.5 text-teal-800">
                <Square className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">
                  {t('home.area')}: {property.totalArea} m²
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard
