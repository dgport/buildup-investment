// types/properties.ts
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  HOTEL = 'HOTEL',
}

export enum DealType {
  RENT = 'RENT',
  SALE = 'SALE',
  DAILY_RENT = 'DAILY_RENT',
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
  address: string // Added translatable address
  description: string | null
}

export interface Property {
  id: string
  externalId: string

  // Required fields
  propertyType: PropertyType
  address: string

  // Optional fields
  status: PropertyStatus | null
  price: number | null
  dealType: DealType | null
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

  // Condition (optional)
  condition: PropertyCondition | null
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

export interface PropertyFilters {
  lang?: string
  page?: number
  limit?: number

  // Main filters
  propertyType?: PropertyType
  address?: string
  priceFrom?: number
  priceTo?: number
  hotSale?: boolean
  public?: boolean

  // Additional filters
  status?: PropertyStatus
  dealType?: DealType
  areaFrom?: number
  areaTo?: number
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  floors?: number
  condition?: PropertyCondition
  heating?: HeatingType
  parking?: ParkingType

  // Boolean amenity filters
  hasConditioner?: boolean
  hasFurniture?: boolean
  hasBalcony?: boolean
  hasInternet?: boolean
  hasNaturalGas?: boolean
}

export interface UpsertPropertyTranslationDto {
  language: string
  title: string
  address: string // Added translatable address
  description?: string
}

export interface CreatePropertyDto {
  // Required fields
  propertyType: PropertyType
  address: string
  title: string

  // Optional fields
  description?: string
  status?: PropertyStatus
  dealType?: DealType
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
  condition?: PropertyCondition
  isNonStandard?: boolean
  occupancy?: Occupancy
  heating?: HeatingType
  hotWater?: HotWaterType
  parking?: ParkingType

  // Amenities
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
