export interface Partner {
  id: number
  companyName: string
  image: string
  createdAt: string
  translation?: PartnerTranslation
}
export interface PartnerFilters {
  lang?: string
  page?: number
  limit?: number
}

export interface PartnersResponse {
  data: Partner[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PartnerTranslation {
  id: number
  language: string
  companyName: string
  partnerId: number
}

export interface UpsertTranslationDto {
  language: string
  companyName: string
}
