'use client'

import type React from 'react'

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

interface PropertyCardProps {
  property: {
    id: string
    externalId: string
    image?: string
    images?: string[]
    galleryImages?: Array<{ imageUrl: string; order?: number }>
    priceUSD: number | null
    priceGEL: number
    location: string | null
    rooms: number
    bedrooms: number
    dateAdded: string
    title: string
    totalArea: number | null
    propertyType: PropertyType
    floors?: number
    hotSale?: boolean // Added hotSale property
  }
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<'USD' | 'GEL'>('USD')
  const [copied, setCopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get all images - prioritize galleryImages, then images array, then fallback to single image
  const allImages =
    property.galleryImages && property.galleryImages.length > 0
      ? property.galleryImages.map(img => img.imageUrl)
      : property.images && property.images.length > 0
        ? property.images
        : property.image
          ? [property.image]
          : []

  const hasMultipleImages = allImages.length > 1

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`)
  }

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
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}/${day}/${year}`
  }

  console.log(property)

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-300 border-b-[3px] border-b-blue-500 transition-all duration-300 h-full cursor-pointer shadow-md hover:shadow-lg"
    >
      <div className="relative h-52 overflow-hidden rounded-t-xl bg-gray-100">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                </button>

                <button
                  onClick={goToNext}
                  onPointerDown={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                </button>

                {/* Image counter */}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10">
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={e => {
                        e.stopPropagation()
                        e.preventDefault()
                        setCurrentImageIndex(index)
                      }}
                      onPointerDown={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 w-2 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
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
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5 z-20 animate-pulse">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {t('properties.hotSale', { defaultValue: 'Hot Sale' })}
            </span>
          </div>
        )}

        {/* ID badge in top-right corner */}
        <div
          className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md flex items-center gap-1.5 z-20"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="text-xs text-gray-700 font-medium">
            ID: {property.externalId}
          </div>
          <button
            onClick={handleCopyId}
            onPointerDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            className="text-gray-600 hover:text-gray-900 transition-colors p-0.5"
            title="Copy ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {property.priceUSD ? (
                  <>
                    {currency === 'USD'
                      ? property.priceUSD.toLocaleString()
                      : Math.round(property.priceUSD * 2.8).toLocaleString()}
                  </>
                ) : (
                  t('home.priceOnRequest')
                )}
              </h3>
              <div
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onPointerDown={e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onMouseDown={e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                className="flex items-center gap-2"
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
            </div>
            <div className="flex items-center gap-1 text-gray-800 text-sm whitespace-nowrap pt-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(property.dateAdded)}</span>
            </div>
          </div>

          <h4 className="text-sm sm:text-base text-gray-800 hover:text-blue-900 transition-colors line-clamp-1">
            {property.title}
          </h4>

          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            {property.rooms > 0 && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Sofa className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t('home.rooms')}: {property.rooms}
                </span>
              </div>
            )}

            {property.totalArea && (
              <div className="flex items-center gap-1.5 text-gray-700">
                <Square className="w-4 h-4" />
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
