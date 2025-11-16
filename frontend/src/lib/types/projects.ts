export interface ProjectTranslation {
  id: number
  projectId: number
  language: string
  projectName: string
  projectLocation: string
}

export interface Project {
  id: number
  projectName: string
  projectLocation: string
  image: string | null
  gallery: string[]
  priceFrom: number | null
  deliveryDate: string | null
  numFloors: number | null
  numApartments: number | null
  hotSale: boolean
  public: boolean
  createdAt: string
  partnerId: number
  translation?: ProjectTranslation | null
  partner?: {
    id: number
    companyName: string
    image: string | null
    translation?: any | null
  } | null
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
  projectLocation: string
}

export interface ProjectFilters {
  lang?: string
  page?: number
  limit?: number
  location?: string
  priceFrom?: number
  priceTo?: number
  partnerId?: number
  public?: boolean
}
