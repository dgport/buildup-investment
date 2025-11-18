import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useState } from 'react'
import PropertyCard from '../properties/PropertyCard'

type Currency = 'USD' | 'GEL'

interface Property {
  id: number
  image: string
  priceUSD: number
  priceGEL: number
  location: string
  floor: number
  rooms: number
  bedrooms: number
  dateAdded: string
}

const PropertyCarousel = () => {
  const [currency, setCurrency] = useState<Currency>('USD')

  const properties: Property[] = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      priceUSD: 450000,
      priceGEL: 1260000,
      location: 'Batumi, Old Town',
      floor: 5,
      rooms: 3,
      bedrooms: 2,
      dateAdded: '2024-10-10T14:30:00',
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      priceUSD: 320000,
      priceGEL: 896000,
      location: 'Tbilisi, Saburtalo',
      floor: 8,
      rooms: 2,
      bedrooms: 1,
      dateAdded: '2024-10-12T09:15:00',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      priceUSD: 580000,
      priceGEL: 1624000,
      location: 'Batumi, New Boulevard',
      floor: 12,
      rooms: 4,
      bedrooms: 3,
      dateAdded: '2024-10-08T16:45:00',
    },
    {
      id: 4,
      image:
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      priceUSD: 275000,
      priceGEL: 770000,
      location: 'Kutaisi, City Center',
      floor: 3,
      rooms: 2,
      bedrooms: 1,
      dateAdded: '2024-10-13T11:20:00',
    },
    {
      id: 5,
      image:
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
      priceUSD: 650000,
      priceGEL: 1820000,
      location: 'Tbilisi, Vake',
      floor: 6,
      rooms: 5,
      bedrooms: 4,
      dateAdded: '2024-10-11T13:00:00',
    },
    {
      id: 6,
      image:
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      priceUSD: 390000,
      priceGEL: 1092000,
      location: 'Batumi, Residence',
      floor: 10,
      rooms: 3,
      bedrooms: 2,
      dateAdded: '2024-10-09T10:30:00',
    },
  ]

  const formatPrice = (priceUSD: number, priceGEL: number): string => {
    if (currency === 'USD') {
      return `$${priceUSD.toLocaleString()}`
    }
    return `$${priceGEL.toLocaleString()}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    )
  }

  return (
    <div className="py-8 px-0 sm:px-6 md:px-8 lg:px-20 bg-white">
      <div className="w-full">
        <div className="flex justify-between items-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Featured Properties
          </h1>
          <button className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
            See All →
          </button>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="md:-ml-3 md:mr-3 -ml-5 mr-5 my-7">
            {properties.map(property => (
              <CarouselItem
                key={property.id}
                className="pl-10 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <PropertyCard
                  property={property}
                  currency={currency}
                  setCurrency={setCurrency}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:-left-8 md:flex bg-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.08)] transition-shadow" />
          <CarouselNext className="right-2 sm:-right-8 md:flex bg-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.08)] transition-shadow" />
        </Carousel>
      </div>
    </div>
  )
}

export default PropertyCarousel
