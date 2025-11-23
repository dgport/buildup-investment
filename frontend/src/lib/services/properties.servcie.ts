import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  PropertiesResponse,
  Property,
  PropertyFilters,
  PropertyTranslation,
  UpsertPropertyTranslationDto,
} from '../types/properties'

export const propertiesService = {
  // Property CRUD
  getAll: (filters?: PropertyFilters) =>
    api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.PROPERTIES, {
      params: filters,
    }),

  getById: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), {
      params: { lang },
    }),

  createProperty: (data: FormData) =>
    api.post<Property>(API_ENDPOINTS.PROPERTIES.PROPERTIES, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateProperty: (id: string, data: FormData) =>
    api.patch<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteProperty: (id: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id)
    ),

  // Property translations
  getTranslations: (id: string) =>
    api.get<PropertyTranslation[]>(API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id)),

  upsertTranslation: (id: string, data: UpsertPropertyTranslationDto) =>
    api.patch<PropertyTranslation>(
      API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id),
      data
    ),

  deleteTranslation: (id: string, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.TRANSLATION_BY_LANGUAGE(id, language)
    ),

  // Property gallery images
  deleteGalleryImage: (propertyId: string, imageId: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.GALLERY_IMAGE(propertyId, imageId)
    ),
}
