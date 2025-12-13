export interface Slide {
  id: number
  image: string
  link: string | null
  order: number
  isActive: boolean
  title: string
  createdAt: string
  updatedAt: string
}

export interface SlideTranslation {
  id: number
  slideId: number
  language: string
  title: string
}

export interface CreateSlideDto {
  title: string
  link?: string
  order?: number
  isActive?: boolean
  image: File
}

export interface UpdateSlideDto {
  title?: string
  link?: string
  order?: number
  isActive?: boolean
  image?: File
}

export interface UpsertSlideTranslationDto {
  language: string
  title: string
}

export interface SlideFilters {
  lang?: string
  page?: number
  limit?: number
}

export interface SlidesResponse {
  data: Slide[]
  meta?: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
