import type { Region } from "./properties";

export enum ProjectStatus {
  PLANNED = "PLANNED",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  COMPLETED = "COMPLETED",
}

export enum UnitAvailability {
  AVAILABLE = "AVAILABLE",
  LIMITED = "LIMITED",
  SOLD_OUT = "SOLD_OUT",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  CLOSED = "CLOSED",
}

export const PROJECT_AMENITIES = [
  "sea_view",
  "beach_access",
  "pool",
  "gym",
  "spa",
  "parking",
  "underground_parking",
  "concierge",
  "security",
  "playground",
  "garden",
  "rooftop",
  "restaurant",
  "shopping",
  "coworking",
  "cinema",
  "elevator",
  "generator",
  "smart_home",
  "hotel_management",
] as const;
export type ProjectAmenity = (typeof PROJECT_AMENITIES)[number];

export interface TranslationRow {
  id: number;
  language: string;
  title?: string | null;
  description: string | null;
  address?: string | null;
}

export interface Developer {
  isDemo?: boolean;
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  foundedYear: number | null;
  published: boolean;
  description: string | null;
  projectsCount: number;
  /** Admin responses only */
  translations?: TranslationRow[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectImage {
  id: number;
  projectId: string;
  unitTypeId: string | null;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface UnitType {
  id: string;
  projectId: string;
  rooms: number;
  bedrooms: number | null;
  areaFrom: number;
  areaTo: number | null;
  pricePerSqm: number | null;
  priceFrom: number | null;
  floorsFrom: number | null;
  floorsTo: number | null;
  availableCount: number | null;
  availability: UnitAvailability;
  sortOrder: number;
  title: string | null;
  description: string | null;
  translations?: TranslationRow[];
  images: ProjectImage[];
}

export interface Project {
  isDemo?: boolean;
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  address: string | null;
  translations?: TranslationRow[];
  developer: Developer;
  region: Region | null;
  regionName: string | null;
  location: string | null;
  status: ProjectStatus;
  progress: number | null;
  deliveryQuarter: number | null;
  deliveryYear: number | null;
  floors: number | null;
  totalApartments: number | null;
  pricePerSqmFrom: number | null;
  priceFrom: number | null;
  hotSale: boolean;
  published: boolean;
  videoUrl: string | null;
  tourUrl: string | null;
  installmentAvailable: boolean;
  downPaymentPercent: number | null;
  installmentMonths: number | null;
  amenities: string[];
  sortOrder: number;
  coverImage: string | null;
  images: ProjectImage[];
  unitTypes: UnitType[];
  summary: {
    roomOptions: number[];
    areaFrom: number | null;
    unitTypesCount: number;
  };
  leadsCount?: number;
  relatedProjects?: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMapItem {
  id: string;
  slug: string;
  title: string | null;
  location: string | null;
  regionName: string | null;
  pricePerSqmFrom: number | null;
  priceFrom: number | null;
  status: ProjectStatus;
  hotSale: boolean;
  coverImage: string | null;
  developer: { name: string; slug: string };
}

export interface ProjectFilters {
  lang?: string;
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  developer?: string;
  status?: string;
  rooms?: number;
  pricePerSqmFrom?: number;
  pricePerSqmTo?: number;
  priceFrom?: number;
  priceTo?: number;
  deliveryYear?: number;
  hotSale?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "delivery";
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProjectsResponse {
  data: Project[];
  meta: PaginatedMeta;
}

/** JSON payload for POST/PATCH /projects (admin). */
export interface ProjectInput {
  developerId?: string;
  slug?: string;
  titleKa?: string;
  titleEn?: string;
  titleRu?: string;
  descriptionKa?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  region?: Region | "";
  address?: string;
  location?: string;
  status?: ProjectStatus;
  progress?: number | "";
  deliveryQuarter?: number | "";
  deliveryYear?: number | "";
  floors?: number | "";
  totalApartments?: number | "";
  pricePerSqmFrom?: number | "";
  priceFrom?: number | "";
  hotSale?: boolean;
  published?: boolean;
  videoUrl?: string;
  tourUrl?: string;
  installmentAvailable?: boolean;
  downPaymentPercent?: number | "";
  installmentMonths?: number | "";
  amenities?: string[];
  sortOrder?: number | "";
}

export interface DeveloperInput {
  name?: string;
  slug?: string;
  website?: string;
  phone?: string;
  email?: string;
  foundedYear?: number | "";
  published?: boolean;
  descriptionKa?: string;
  descriptionEn?: string;
  descriptionRu?: string;
}

export interface UnitTypeInput {
  rooms?: number | "";
  bedrooms?: number | "";
  areaFrom?: number | "";
  areaTo?: number | "";
  pricePerSqm?: number | "";
  priceFrom?: number | "";
  floorsFrom?: number | "";
  floorsTo?: number | "";
  availableCount?: number | "";
  availability?: UnitAvailability;
  sortOrder?: number | "";
  titleKa?: string;
  titleEn?: string;
  titleRu?: string;
  descriptionKa?: string;
  descriptionEn?: string;
  descriptionRu?: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  unitTypeId?: string;
  locale?: string;
  website?: string; // honeypot
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  locale: string;
  status: LeadStatus;
  note: string | null;
  createdAt: string;
  project: { id: string; slug: string; title: string };
  unitType: { id: string; rooms: number; areaFrom: number; title: string | null } | null;
}

export interface LeadsResponse {
  data: Lead[];
  meta: PaginatedMeta & { counts: Partial<Record<LeadStatus, number>> };
}
