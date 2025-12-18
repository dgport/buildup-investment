import { useParams } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Copy,
  Check,
  MapPin,
} from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useProperty } from '@/lib/hooks/useProperties'
import { getImageUrl } from '@/lib/utils/image-utils'
import MortgageCalculator from '@/components/shared/calculator/MortgageCalculator'
import MapboxMap from '@/components/shared/map/MapboxMap'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useTranslation } from 'react-i18next'
import IsError from '@/components/shared/loaders/IsError'
import { LoadingOverlay } from '@/components/shared/loaders/LoadingOverlay'
import { PropertyDetailsSection } from '@/components/pages/properties/PropertyDetailSection'
import { ConditionUtilitiesSection } from '@/components/pages/properties/ConditionUtilitiesSection'
import { AmenitiesFeaturesSection } from '@/components/pages/properties/AmenitiesFeatureSection'
import { useCurrency } from '@/lib/context/CurrencyContext'
 

const PHONE_NUMBER = '+995 595 80 47 95'
const PHONE_NUMBER_CLEAN = '995595804795'

export default function PropertyDetail() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const { currency, setCurrency, exchangeRate } = useCurrency()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const { data: property, isLoading, error } = useProperty(id!, i18n.language)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )

  const handleThumbClick = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      emblaApi && emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const formatPrice = (priceUSD: number | null): string => {
    if (!priceUSD) return 'Price on request'
    if (currency === 'USD') {
      return `$${priceUSD.toLocaleString()}`
    }
    const priceGEL = Math.round(priceUSD * exchangeRate)
    return `₾${priceGEL.toLocaleString()}`
  }

  const formatEnumValue = (value: string | null): string => {
    if (!value) return 'N/A'
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleCopyId = async () => {
    const idToCopy = property?.externalId || property?.id
    if (idToCopy) {
      await navigator.clipboard.writeText(String(idToCopy))
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleCopyPhone = async () => {
    await navigator.clipboard.writeText(PHONE_NUMBER)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handlePhoneCall = () => {
    window.location.href = `tel:${PHONE_NUMBER_CLEAN}`
  }

  const handleWhatsApp = () => {
    const propertyTitle = property?.translation?.title || 'a property'
    const message = encodeURIComponent(
      `Hello! I'm interested in ${propertyTitle} (ID: ${property?.externalId || property?.id})`
    )
    window.open(`https://wa.me/${PHONE_NUMBER_CLEAN}?text=${message}`, '_blank')
  }

  const handleImageClick = () => {
    setLightboxIndex(selectedIndex)
    setLightboxOpen(true)
  }

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} />
  }

  if (error || !property) {
    return <IsError />
  }

  const images =
    property.galleryImages?.map(img => getImageUrl(img.imageUrl)) || []

  const lightboxSlides = images.map((src: string) => ({ src }))

  const priceInGEL = property.price
    ? Math.round(property.price * exchangeRate)
    : null
  const coordinates = property?.location
    ? (() => {
        try {
          const [lat, lng] = property.location.split(',').map(Number)
          if (isNaN(lat) || isNaN(lng)) return null
          return { lat, lng }
        } catch (error) {
          return null
        }
      })()
    : null

  const locationParts = []
  const streetAddress = property.translation?.address || property.address
  if (streetAddress) locationParts.push(streetAddress)
  if (property.regionName) locationParts.push(property.regionName)

  const locationString =
    locationParts.length > 0
      ? locationParts.join(', ')
      : t('propertyPage.noLocation', { defaultValue: 'Location not available' })

  const hasLocation = !!coordinates

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 h-[350px] lg:h-[500px]">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full relative">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.length > 0 ? (
                    images.map((img, index) => (
                      <div
                        className="relative flex-[0_0_100%] h-full"
                        key={index}
                      >
                        <div
                          className="relative flex justify-center items-center h-full cursor-zoom-in bg-black/5"
                          onClick={handleImageClick}
                        >
                          <img
                            src={img || '/placeholder.svg'}
                            alt={property.translation?.title || 'Property'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-400">No images available</p>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 z-20 px-4">
                  <div className="bg-black/10 rounded-xl p-3">
                    <div className="overflow-hidden" ref={thumbsRef}>
                      <div className="flex gap-2">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            onClick={() => handleThumbClick(index)}
                            className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all border-4
                ${index === selectedIndex ? 'border-blue-600 scale-105 shadow-xl' : 'border-white/50 opacity-70 hover:opacity-100 hover:border-blue-500/50'}`}
                            style={{ width: '64px', height: '48px' }}
                          >
                            <img
                              src={img || '/placeholder.svg'}
                              alt={`Thumbnail ${index}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-5 h-auto lg:h-[500px] flex flex-col justify-between">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Property ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 text-xs sm:text-sm">
                      {property.externalId || property.id}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Region
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                    {property.regionName ||
                      t('propertyPage.notAvailable', {
                        defaultValue: 'N/A',
                      })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Price
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Currency
                  </span>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2.5 py-1.5">
                    <span
                      className={`text-xs font-medium ${currency === 'USD' ? 'text-blue-900' : 'text-gray-400'}`}
                    >
                      USD
                    </span>
                    <Switch
                      checked={currency === 'GEL'}
                      onCheckedChange={checked =>
                        setCurrency(checked ? 'GEL' : 'USD')
                      }
                    />
                    <span
                      className={`text-xs font-medium ${currency === 'GEL' ? 'text-blue-900' : 'text-gray-400'}`}
                    >
                      GEL
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Property Type
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-blue-900">
                    {formatEnumValue(property.propertyType)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Listed on
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-3 sm:pt-4">
                <div className="relative">
                  <Button
                    size="lg"
                    onClick={handlePhoneCall}
                    className="w-full bg-blue-900 hover:bg-blue-800 h-10 sm:h-11 lg:h-12 text-sm sm:text-base flex items-center justify-center pr-12"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    {PHONE_NUMBER}
                  </Button>
                  <button
                    onClick={handleCopyPhone}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-800 rounded transition-colors"
                    title="Copy phone number"
                  >
                    {copiedPhone ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWhatsApp}
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 h-10 sm:h-11 lg:h-12 text-sm sm:text-base flex items-center justify-center bg-transparent"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  {t('propertyPage.contactWhatsApp', {
                    defaultValue: 'Contact WhatsApp',
                  })}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
              {property.translation?.title ||
                t('propertyPage.noTitle', {
                  defaultValue: 'Untitled Property',
                })}
            </h1>
            <div className="h-px w-full bg-gray-300 my-4"></div>
            {property.translation?.description ? (
              <p className="text-gray-700 whitespace-pre-line">
                {property.translation.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                {t('propertyPage.noDescription', {
                  defaultValue: 'No description available',
                })}
              </p>
            )}
          </div>

          <PropertyDetailsSection property={property} />
          {locationString && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {t('propertyPage.location', { defaultValue: 'Location' })}
              </h3>
              <p className="text-gray-700 text-base">{locationString}</p>
            </div>
          )}

          <ConditionUtilitiesSection property={property} />

          <AmenitiesFeaturesSection property={property} />

          {hasLocation && (
            <div className="mt-8 lg:mt-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 overflow-hidden">
                <div className="h-[300px] sm:h-[350px] rounded-xl overflow-hidden">
                  <MapboxMap
                    latitude={coordinates.lat}
                    longitude={coordinates.lng}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <MortgageCalculator initialPrice={priceInGEL} />
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  )
}
