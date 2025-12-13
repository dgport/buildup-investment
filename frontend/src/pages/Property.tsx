import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import {
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  Layers,
  ArrowUpDown,
  Ruler,
  Thermometer,
  Droplet,
  Car,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useProperty } from '@/lib/hooks/useProperties'

type Currency = 'USD' | 'GEL'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<Currency>('USD')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { data: property, isLoading, error } = useProperty(id!)

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
    const priceGEL = Math.round(priceUSD * 2.8)
    return `₾${priceGEL.toLocaleString()}`
  }

  const formatEnumValue = (value: string | null): string => {
    if (!value) return 'N/A'
    return value
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Property Not Found
          </h2>
          <button
            onClick={() => navigate('/properties')}
            className="text-blue-600 hover:underline"
          >
            Back to Properties
          </button>
        </div>
      </div>
    )
  }

  const images =
    property.galleryImages?.map(
      img => `${import.meta.env.VITE_API_IMAGE_URL}/${img.imageUrl}`
    ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-96 md:h-[500px]">
                <div className="overflow-hidden h-full" ref={emblaRef}>
                  <div className="flex h-full">
                    {images.length > 0 ? (
                      images.map((img, index) => (
                        <div
                          className="relative flex-[0_0_100%] h-full"
                          key={index}
                        >
                          <div className="relative flex justify-center h-full">
                            <div
                              className="absolute inset-0 z-0"
                              style={{
                                backgroundImage: `url(${img})`,
                                backgroundSize: '150%',
                                backgroundPosition: 'center',
                                filter: 'blur(15px)',
                              }}
                            />
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                              <img
                                src={img}
                                alt={property.translation?.title || 'Property'}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg z-20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="relative">
                <div className="overflow-hidden" ref={thumbsRef}>
                  <div className="flex space-x-2">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`flex-[0_0_auto] cursor-pointer rounded-lg overflow-hidden transition-all ${
                          index === selectedIndex
                            ? 'ring-2 ring-blue-600 scale-105'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => handleThumbClick(index)}
                        style={{ width: '96px', height: '72px' }}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm h-96 md:h-[500px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Contact Agent
              </h3>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Send Message
              </button>
              <button className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors">
                Call Now
              </button>

              <div className="mt-6 pt-6 border-t flex-grow">
                <p className="text-sm text-gray-500 mb-2">Property ID</p>
                <p className="font-mono text-gray-900">
                  {property.externalId || property.id}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Listed on</p>
                <p className="text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.translation?.title || 'Untitled Property'}
                </h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.address}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {formatEnumValue(property.propertyType)}
                </Badge>
                <Badge variant="outline">
                  {formatEnumValue(property.status)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <h2 className="text-4xl font-bold text-green-600">
                {formatPrice(property.price)}
              </h2>
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                <span
                  className={`text-sm font-medium ${currency === 'USD' ? 'text-blue-600' : 'text-gray-400'}`}
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
                  className={`text-sm font-medium ${currency === 'GEL' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  GEL
                </span>
              </div>
            </div>
          </div>

          {property.translation?.description && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {property.translation.description}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Property Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.totalArea && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Square className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Area</p>
                    <p className="font-semibold">{property.totalArea} m²</p>
                  </div>
                </div>
              )}
              {property.rooms && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Rooms</p>
                    <p className="font-semibold">{property.rooms}</p>
                  </div>
                </div>
              )}
              {property.bedrooms && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.floors && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Floor</p>
                    <p className="font-semibold">{property.floors}</p>
                  </div>
                </div>
              )}
              {property.floorsTotal && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ArrowUpDown className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Floors</p>
                    <p className="font-semibold">{property.floorsTotal}</p>
                  </div>
                </div>
              )}
              {property.ceilingHeight && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Ruler className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Ceiling Height</p>
                    <p className="font-semibold">{property.ceilingHeight} m</p>
                  </div>
                </div>
              )}
              {property.balconyArea && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Square className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Balcony Area</p>
                    <p className="font-semibold">{property.balconyArea} m²</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Condition & Utilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.condition && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Condition</p>
                  <p className="font-semibold">
                    {formatEnumValue(property.condition)}
                  </p>
                </div>
              )}
              {property.occupancy && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Occupancy</p>
                  <p className="font-semibold">
                    {formatEnumValue(property.occupancy)}
                  </p>
                </div>
              )}
              {property.heating && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Heating</p>
                    <p className="font-semibold text-sm">
                      {formatEnumValue(property.heating)}
                    </p>
                  </div>
                </div>
              )}
              {property.hotWater && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Droplet className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Hot Water</p>
                    <p className="font-semibold text-sm">
                      {formatEnumValue(property.hotWater)}
                    </p>
                  </div>
                </div>
              )}
              {property.parking && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Car className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Parking</p>
                    <p className="font-semibold text-sm">
                      {formatEnumValue(property.parking)}
                    </p>
                  </div>
                </div>
              )}
              {property.isNonStandard && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-semibold text-orange-700">
                    Non-Standard Layout
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Amenities & Features
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.hasConditioner && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Air Conditioner</span>
                </div>
              )}
              {property.hasFurniture && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Furniture</span>
                </div>
              )}
              {property.hasBed && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Bed</span>
                </div>
              )}
              {property.hasSofa && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Sofa</span>
                </div>
              )}
              {property.hasTable && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Table</span>
                </div>
              )}
              {property.hasChairs && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Chairs</span>
                </div>
              )}
              {property.hasStove && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Stove</span>
                </div>
              )}
              {property.hasRefrigerator && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Refrigerator</span>
                </div>
              )}
              {property.hasOven && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Oven</span>
                </div>
              )}
              {property.hasWashingMachine && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Washing Machine</span>
                </div>
              )}
              {property.hasKitchenAppliances && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Kitchen Appliances</span>
                </div>
              )}
              {property.hasBalcony && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Balcony</span>
                </div>
              )}
              {property.hasNaturalGas && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Natural Gas</span>
                </div>
              )}
              {property.hasInternet && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Internet</span>
                </div>
              )}
              {property.hasTV && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">TV</span>
                </div>
              )}
              {property.hasSewerage && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Sewerage</span>
                </div>
              )}
              {property.isFenced && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Fenced</span>
                </div>
              )}
              {property.hasYardLighting && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Yard Lighting</span>
                </div>
              )}
              {property.hasGrill && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Grill</span>
                </div>
              )}
              {property.hasAlarm && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Alarm</span>
                </div>
              )}
              {property.hasVentilation && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Ventilation</span>
                </div>
              )}
              {property.hasWater && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Water</span>
                </div>
              )}
              {property.hasElectricity && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Electricity</span>
                </div>
              )}
              {property.hasGate && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Gate</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
