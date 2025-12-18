export enum Region {
  BATUMI = 'BATUMI',
  KOBULETI = 'KOBULETI',
  CHAKVI = 'CHAKVI',
  MAKHINJAURI = 'MAKHINJAURI',
  GONIO = 'GONIO',
  UREKI = 'UREKI',
}

// Optional: If you want human-readable names for the new regions
export const REGION_NAMES: Record<Region, string> = {
  [Region.BATUMI]: 'Batumi',
  [Region.KOBULETI]: 'Kobuleti',
  [Region.CHAKVI]: 'Chakvi',
  [Region.MAKHINJAURI]: 'Makhinjauri',
  [Region.GONIO]: 'Gonio',
  [Region.UREKI]: 'Ureki',
}

export interface ProjectFilters {
  lang: string
  page?: number
  limit?: number
  location?: string
  region?: Region
  priceFrom?: number
  priceTo?: number
  partnerId?: number
  public?: boolean
}

export interface ProjectTranslation {
  id: number
  projectId: number
  language: string
  projectName: string
  street?: string
  description?: string
}

export interface PartnerTranslation {
  id: number
  partnerId: number
  language: string
  companyName: string
}

export interface Partner {
  id: number
  companyName: string
  image?: string
  translation?: PartnerTranslation
}

export interface Project {
  id: number
  projectName: string
  location?: string
  street?: string
  region?: Region
  regionName?: string
  image?: string
  gallery: string[]
  priceFrom?: number
  deliveryDate?: string
  numFloors?: number
  numApartments?: number
  hotSale: boolean
  public: boolean
  createdAt: string
  updatedAt: string
  translation?: ProjectTranslation
  partner?: Partner
  partnerId: number
}

export interface ProjectsResponse {
  data: Project[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface UpsertProjectTranslationDto {
  language: string
  projectName: string
  street?: string
}
