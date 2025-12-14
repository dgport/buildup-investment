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
  address: string | null
  location: string | null
  description: string | null
}

export interface Property {
  id: string
  externalId: string

  // Required fields
  propertyType: PropertyType

  // Location fields (all optional)
  city: City | null
  address: string | null
  location: string | null

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
  // Pagination
  page?: number
  limit?: number
  lang?: string
  externalId?: string

  // Main filters
  city?: string
  propertyType?: string
  address?: string
  priceFrom?: number
  priceTo?: number
  hotSale?: boolean
  public?: boolean // For admin: show all properties or only public ones

  // Additional filters
  status?: string
  dealType?: string
  areaFrom?: number
  areaTo?: number
  rooms?: number // 5+ will query >= 5
  bedrooms?: number // 4+ will query >= 4
  bathrooms?: number // 3+ will query >= 3
  floors?: number
  condition?: string
  heating?: string
  parking?: string

  // Boolean amenity filters (only true values are considered)
  hasConditioner?: boolean
  hasFurniture?: boolean
  hasBalcony?: boolean
  hasInternet?: boolean
  hasNaturalGas?: boolean
}

export interface PropertyTranslation {
  id: number
  language: string
  title: string
  address: string | null
  description: string | null
  propertyId: string
}

export interface UpsertPropertyTranslationDto {
  language: string
  title: string
  address?: string
  description?: string
  // Note: location is NOT included - it's non-translatable
}

export interface CreatePropertyDto {
  // Required fields
  propertyType: PropertyType
  title: string

  // Location fields (all optional)
  city?: City
  address?: string
  location?: string

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

export type UpdatePropertyDto = Partial<CreatePropertyDto>
