// Property enums
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  HOTEL = 'HOTEL',
}

export enum DealType {
  SALE = 'SALE',
  RENT = 'RENT',
  DAILY_RENT = 'DAILY_RENT',
}

export enum HeatingType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  INDIVIDUAL = 'INDIVIDUAL',
  GAS = 'GAS',
  ELECTRIC = 'ELECTRIC',
  NONE = 'NONE',
}

export enum HotWaterType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  BOILER = 'BOILER',
  SOLAR = 'SOLAR',
  NONE = 'NONE',
}

export enum ParkingType {
  PARKING_SPACE = 'PARKING_SPACE',
  GARAGE = 'GARAGE',
  OPEN_LOT = 'OPEN_LOT',
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

export enum Region {
  BATUMI = 'BATUMI',
  KOBULETI = 'KOBULETI',
  CHAKVI = 'CHAKVI',
  MAKHINJAURI = 'MAKHINJAURI',
  GONIO = 'GONIO',
  UREKI = 'UREKI',
}

export const REGION_NAMES: Record<string, string> = {
  BATUMI: 'Batumi',
  KOBULETI: 'Kobuleti',
  CHAKVI: 'Chakvi',
  MAKHINJAURI: 'Makhinjauri',
  GONIO: 'Gonio',
  UREKI: 'Ureki',
}

export interface PropertyTranslation {
  id: number
  language: string
  title: string
  address: string | null
  description: string | null
  propertyId: string
}

export interface PropertyGalleryImage {
  id: number
  propertyId: string
  imageUrl: string
  order: number
  createdAt: string
}

export interface Property {
  id: string
  externalId: string
  propertyType: PropertyType
  dealType: DealType
  location: string | null // City name like "Batumi", "Tbilisi"
  region: Region | null // Region enum
  regionName: string | null // Translated region name
  address: string | null // Street address
  hotSale: boolean
  public: boolean
  price: number | null
  totalArea: number | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  floors: number | null
  floorsTotal: number | null
  ceilingHeight: number | null
  isNonStandard: boolean
  occupancy: Occupancy | null
  heating: HeatingType | null
  hotWater: HotWaterType | null
  parking: ParkingType | null
  balconyArea: number | null
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
  translation: PropertyTranslation | null
  galleryImages: PropertyGalleryImage[]
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyDto {
  propertyType: PropertyType
  dealType: DealType
  title: string
  description?: string
  location?: string // City name like "Batumi", "Tbilisi"
  region?: Region
  address?: string // Street address
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
  balconyArea?: number
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

export interface UpsertPropertyTranslationDto {
  language: string
  title: string
  address?: string
  description?: string
}

export interface PropertyFilters {
  lang?: string
  page?: number
  limit?: number
  externalId?: string
  region?: Region
  propertyType?: PropertyType | string
  dealType?: DealType | string
  priceFrom?: number
  priceTo?: number
  areaFrom?: number
  areaTo?: number
  rooms?: number
  bedrooms?: number
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
