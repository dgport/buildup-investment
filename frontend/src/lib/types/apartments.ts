export interface Apartment {
  id: number
  room: number
  area: number
  images: string[]
  description: string | null // Backend maps translations[0].description to this
  createdAt: string
  // Project is optional based on your Prisma logic
  project?: {
    id: number
    projectName: string
    projectLocation: string
    image?: string | null
    gallery?: string[]
    priceFrom?: number
    deliveryDate?: string | Date
    numFloors?: number
    numApartments?: number
  } | null
}

export interface ApartmentTranslation {
  id: number
  apartmentId: number
  language: string
  description: string | null
}

// Matches the return of ApartmentsService.findAll
export interface ApartmentsResponse {
  data: Apartment[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Parameters strictly matching the Controller @Query
export interface GetApartmentsParams {
  lang?: string
  page?: number
  limit?: number
  projectId?: number
}

export interface UpsertTranslationDto {
  language: string
  description: string
}
