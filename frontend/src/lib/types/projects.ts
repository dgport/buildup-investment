export interface ProjectFilters {
  lang: string
  page?: number
  limit?: number
  location?: string
  priceFrom?: number
  partnerId?: number
}

export interface ProjectTranslation {
  id: number
  projectId: number
  language: string
  projectName?: string
  projectLocation?: string
}

export interface Partner {
  id: number
  companyName: string
  image: string
  translation?: {
    id: number
    partnerId: number
    language: string
    companyName: string
  }
}

export interface Project {
  id: number
  projectName: string
  projectLocation: string
  image: string
  gallery: string[]
  priceFrom: number | null
  deliveryDate: string | null
  numFloors: number | null
  numApartments: number | null
  hotSale: boolean
  public: boolean
  createdAt: string
  updatedAt: string
  translation?: ProjectTranslation
  partner?: Partner
  partnerId?: number
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
  projectName?: string
  projectLocation?: string
}
