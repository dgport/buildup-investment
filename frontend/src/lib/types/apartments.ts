import type { Project } from "./projects"

export interface ApartmentTranslation {
  id: number
  apartmentId: number
  language: string
  description: string
}

export interface Apartment {
  id: number
  room: number
  area: number
  floor: number
  totalFloors: number
  images: string[]
  description: string | null
  createdAt: string
  project: Project
  translation?: ApartmentTranslation | null
}
