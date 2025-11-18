import PropertyCard from '@/components/pages/properties/PropertyCard'
import { useState } from 'react'
import test from '@/assets/svgs/image.png'

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

type Currency = 'USD' | 'GEL'

export default function Property() {
  const [currency, setCurrency] = useState<Currency>('USD')

  const properties: Property[] = [
    {
      id: 1,
      image: test,
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
    {
      id: 7,
      image:
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
      priceUSD: 520000,
      priceGEL: 1456000,
      location: 'Tbilisi, Old Town',
      floor: 4,
      rooms: 3,
      bedrooms: 2,
      dateAdded: '2024-10-07T15:20:00',
    },
    {
      id: 8,
      image:
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      priceUSD: 380000,
      priceGEL: 1064000,
      location: 'Batumi, Seaside',
      floor: 7,
      rooms: 2,
      bedrooms: 1,
      dateAdded: '2024-10-14T08:45:00',
    },
  ]

  const formatPrice = (priceUSD: number, priceGEL: number): string => {
    if (currency === 'USD') {
      return `${priceUSD.toLocaleString()}`
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Properties
          </h1>
          <p className="text-gray-600">
            Explore our collection of premium properties
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              currency={currency}
              setCurrency={setCurrency}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
