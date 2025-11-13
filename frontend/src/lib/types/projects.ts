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
