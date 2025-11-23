// Enums
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  HOTEL = 'HOTEL',
}

export enum PropertyStatus {
  OLD_BUILDING = 'OLD_BUILDING',
  NEW_BUILDING = 'NEW_BUILDING',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
}

export enum PropertyCondition {
  NEWLY_RENOVATED = 'NEWLY_RENOVATED',
  OLD_RENOVATED = 'OLD_RENOVATED',
  REPAIRING = 'REPAIRING',
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

// Gallery Image
export interface PropertyGalleryImage {
  id: number
  propertyId: string
  imageUrl: string
  order: number
  createdAt: string
}

// Translation
export interface PropertyTranslation {
  id: number
  propertyId: string
  language: string
  title: string
  description: string | null
}

// Property
export interface Property {
  id: string
  externalId: string | null
  propertyType: PropertyType
  status: PropertyStatus
  address: string
  price: number | null
  createdAt: string
  updatedAt: string

  // Main details
  totalArea: number | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  floors: number | null
  floorsTotal: number | null
  ceilingHeight: number | null

  // Condition & Status
  condition: PropertyCondition | null
  isNonStandard: boolean

  // Occupancy
  occupancy: Occupancy | null

  // Utilities
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

  // Relations
  translations: PropertyTranslation[]
  galleryImages: PropertyGalleryImage[]
  translation?: PropertyTranslation | null
}

// Response types
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

// Filter types
export interface PropertyFilters {
  lang?: string
  page?: number
  limit?: number
  propertyType?: PropertyType
  status?: PropertyStatus
}

// DTO types
export interface UpsertPropertyTranslationDto {
  language: string
  title: string
  description?: string
}
