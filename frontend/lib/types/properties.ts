export enum PropertyType {
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  COMMERCIAL = "COMMERCIAL",
  LAND = "LAND",
  HOTEL = "HOTEL",
}

export enum DealType {
  SALE = "SALE",
  RENT = "RENT",
  DAILY_RENT = "DAILY_RENT",
}

export enum PropertyStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DRAFT = "DRAFT",
}

export enum HeatingType {
  CENTRAL_HEATING = "CENTRAL_HEATING",
  INDIVIDUAL = "INDIVIDUAL",
  GAS = "GAS",
  ELECTRIC = "ELECTRIC",
  NONE = "NONE",
}

export enum HotWaterType {
  CENTRAL_HEATING = "CENTRAL_HEATING",
  BOILER = "BOILER",
  SOLAR = "SOLAR",
  NONE = "NONE",
}

export enum ParkingType {
  PARKING_SPACE = "PARKING_SPACE",
  GARAGE = "GARAGE",
  OPEN_LOT = "OPEN_LOT",
  NONE = "NONE",
}

export enum Occupancy {
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
  EIGHT = "EIGHT",
  NINE = "NINE",
  TEN_PLUS = "TEN_PLUS",
}

export enum Region {
  BATUMI = "BATUMI",
  KOBULETI = "KOBULETI",
  CHAKVI = "CHAKVI",
  MAKHINJAURI = "MAKHINJAURI",
  GONIO = "GONIO",
  UREKI = "UREKI",
}

/** Languages the API stores translations in (site UI only offers ka/en). */
export const PROPERTY_LANGUAGES = ["ka", "en", "ru"] as const;
export type PropertyLanguage = (typeof PROPERTY_LANGUAGES)[number];

export interface PropertyTranslation {
  id: number;
  language: string;
  title: string;
  address: string | null;
  description: string | null;
  propertyId: string;
}

export interface PropertyGalleryImage {
  id: number;
  propertyId: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface PropertyUser {
  id: string;
  firstname: string;
  lastname: string;
  phone: string | null;
  /** Only present in owner/admin responses */
  email?: string;
}

/** Boolean feature flags of a property (amenities / utilities). */
export const AMENITY_KEYS = [
  "hasConditioner",
  "hasFurniture",
  "hasBed",
  "hasSofa",
  "hasTable",
  "hasChairs",
  "hasStove",
  "hasRefrigerator",
  "hasOven",
  "hasWashingMachine",
  "hasKitchenAppliances",
  "hasBalcony",
  "hasNaturalGas",
  "hasInternet",
  "hasTV",
  "hasSewerage",
  "isFenced",
  "hasYardLighting",
  "hasGrill",
  "hasAlarm",
  "hasVentilation",
  "hasWater",
  "hasElectricity",
  "hasGate",
] as const;
export type AmenityKey = (typeof AMENITY_KEYS)[number];

export type PropertyAmenities = Record<AmenityKey, boolean>;

export interface Property extends PropertyAmenities {
  id: string;
  externalId: string;
  propertyType: PropertyType;
  dealType: DealType;
  status: PropertyStatus;
  location: string | null;
  region: Region | null;
  regionName: string | null;
  address: string | null;
  hotSale: boolean;
  public: boolean;
  price: number | null;
  contactPhone: string | null;
  userId: string | null;
  user: PropertyUser | null;
  /** Only present in owner/admin responses */
  rejectionReason?: string | null;
  totalArea: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  floorsTotal: number | null;
  ceilingHeight: number | null;
  isNonStandard: boolean;
  occupancy: Occupancy | null;
  heating: HeatingType | null;
  hotWater: HotWaterType | null;
  parking: ParkingType | null;
  balconyArea: number | null;
  /** Best translation for the requested language */
  translation: PropertyTranslation | null;
  /** Every language – only present in owner/admin responses */
  translations?: PropertyTranslation[];
  galleryImages: PropertyGalleryImage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Multipart payload for POST /properties and PATCH /properties/:id.
 * On update an empty string clears a nullable field; `undefined` leaves it.
 */
export interface CreatePropertyDto extends Partial<PropertyAmenities> {
  propertyType: PropertyType;
  dealType: DealType;
  titleKa?: string;
  titleEn?: string;
  titleRu?: string;
  descriptionKa?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  location?: string;
  region?: Region | "";
  address?: string;
  contactPhone?: string;
  hotSale?: boolean;
  public?: boolean;
  price?: number | "";
  totalArea?: number | "";
  rooms?: number | "";
  bedrooms?: number | "";
  bathrooms?: number | "";
  floors?: number | "";
  floorsTotal?: number | "";
  ceilingHeight?: number | "";
  balconyArea?: number | "";
  isNonStandard?: boolean;
  occupancy?: Occupancy | "";
  heating?: HeatingType | "";
  hotWater?: HotWaterType | "";
  parking?: ParkingType | "";
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;

export interface UpsertPropertyTranslationDto {
  language: string;
  title: string;
  address?: string;
  description?: string;
}

export interface PropertyFilters {
  lang?: string;
  page?: number;
  limit?: number;
  externalId?: string;
  region?: Region | string;
  propertyType?: PropertyType | string;
  dealType?: DealType | string;
  priceFrom?: number;
  priceTo?: number;
  areaFrom?: number;
  areaTo?: number;
  rooms?: number;
  bedrooms?: number;
  hotSale?: boolean;
}

export interface PropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PropertyStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
}
