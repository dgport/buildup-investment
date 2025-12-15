// types/properties.ts
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  HOTEL = 'HOTEL',
}

export enum City {
  BATUMI = 'BATUMI',
  TBILISI = 'TBILISI',
}

export enum DealType {
  RENT = 'RENT',
  SALE = 'SALE',
  DAILY_RENT = 'DAILY_RENT',
}

export enum HeatingType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  INDIVIDUAL = 'INDIVIDUAL',
  GAS = 'GAS',
  ELECTRIC = 'ELECTRIC',
  NONE = 'NONE',
}

export enum ParkingType {
  PARKING_SPACE = 'PARKING_SPACE',
  GARAGE = 'GARAGE',
  OPEN_LOT = 'OPEN_LOT',
  NONE = 'NONE',
}

export enum HotWaterType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  BOILER = 'BOILER',
  SOLAR = 'SOLAR',
  NONE = 'NONE',
}

export enum Occupancy {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
  SEVEN = 'SEVEN',
  EIGHT = 'EIGHT',
  NINE = 'NINE',
  TEN_PLUS = 'TEN_PLUS',
}

export interface PropertyGalleryImage {
  id: number
  propertyId: string
  imageUrl: string
  order: number
  createdAt: string
}

export interface PropertyTranslation {
  id: number
  propertyId: string
  language: string
  title: string
  address: string | null
  description: string | null
}

export interface Property {
  id: string
  externalId: string

  // Required fields
  propertyType: PropertyType
  dealType: DealType

  // Location fields (all optional)
  city: City | null
  address: string | null
  location: string | null

  // Optional fields
  price: number | null
  hotSale: boolean
  public: boolean
  createdAt: string
  updatedAt: string

  // Property specifications (all optional)
  totalArea: number | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  floors: number | null
  floorsTotal: number | null
  ceilingHeight: number | null
  isNonStandard: boolean

  // Occupancy (optional)
  occupancy: Occupancy | null

  // Utilities (all optional)
  heating: HeatingType | null
  hotWater: HotWaterType | null
  parking: ParkingType | null

  // Amenities
  hasConditioner: boolean
  hasFurniture: boolean
  hasBed: boolean
  hasSofa: boolean
  hasTable: boolean
  hasChairs: boolean
  hasStove: boolean
  hasRefrigerator: boolean
  hasOven: boolean
  hasWashingMachine: boolean
  hasKitchenAppliances: boolean
  hasBalcony: boolean
  balconyArea: number | null
  hasNaturalGas: boolean
  hasInternet: boolean
  hasTV: boolean
  hasSewerage: boolean
  isFenced: boolean
  hasYardLighting: boolean
  hasGrill: boolean
  hasAlarm: boolean
  hasVentilation: boolean
  hasWater: boolean
  hasElectricity: boolean
  hasGate: boolean

  translations: PropertyTranslation[]
  galleryImages: PropertyGalleryImage[]
  translation?: PropertyTranslation | null
}

export interface PropertiesResponse {
  data: Property[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Simplified filters - only what backend supports
export interface PropertyFilters {
  // Pagination & Language
  page?: number
  limit?: number
  lang?: string

  // Core filters (what backend actually supports)
  externalId?: string
  city?: string
  propertyType?: string
  dealType?: string
  priceFrom?: number
  priceTo?: number
  areaFrom?: number
  areaTo?: number
  rooms?: number
  bedrooms?: number
}

export interface UpsertPropertyTranslationDto {
  language: string
  title: string
  address?: string
  description?: string
}

export interface CreatePropertyDto {
  // REQUIRED fields
  propertyType: PropertyType
  dealType: DealType
  title: string

  // Location (all optional strings)
  city?: City
  address?: string
  location?: string

  // Optional fields
  description?: string
  hotSale?: boolean
  public?: boolean
  price?: number
  totalArea?: number
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  floors?: number
  floorsTotal?: number
  ceilingHeight?: number
  isNonStandard?: boolean
  occupancy?: Occupancy
  heating?: HeatingType
  hotWater?: HotWaterType
  parking?: ParkingType

  // Amenities (all optional booleans)
  hasConditioner?: boolean
  hasFurniture?: boolean
  hasBed?: boolean
  hasSofa?: boolean
  hasTable?: boolean
  hasChairs?: boolean
  hasStove?: boolean
  hasRefrigerator?: boolean
  hasOven?: boolean
  hasWashingMachine?: boolean
  hasKitchenAppliances?: boolean
  hasBalcony?: boolean
  balconyArea?: number
  hasNaturalGas?: boolean
  hasInternet?: boolean
  hasTV?: boolean
  hasSewerage?: boolean
  isFenced?: boolean
  hasYardLighting?: boolean
  hasGrill?: boolean
  hasAlarm?: boolean
  hasVentilation?: boolean
  hasWater?: boolean
  hasElectricity?: boolean
  hasGate?: boolean
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>
