// services/properties.service.ts
import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  PropertiesResponse,
  Property,
  PropertyFilters,
  PropertyTranslation,
  UpsertPropertyTranslationDto,
  CreatePropertyDto,
} from '../types/properties'

export const propertiesService = {
  /**
   * Get all properties with filters
   */
  getAll: (filters?: PropertyFilters) =>
    api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.PROPERTIES, {
      params: filters,
    }),

  /**
   * Get property by ID
   */
  getById: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), {
      params: { lang },
    }),

  /**
   * Create a new property with images
   */
  createProperty: (data: CreatePropertyDto, images?: File[]) => {
    const formData = new FormData()
    
    // Append all property fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    // Append images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image)
      })
    }
    
    return api.post<Property>(API_ENDPOINTS.PROPERTIES.PROPERTIES, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Update property
   */
  updateProperty: (id: string, data: Partial<CreatePropertyDto>, images?: File[]) => {
    const formData = new FormData()
    
    // Append updated fields only
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    // Append new images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image)
      })
    }
    
    return api.patch<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Delete property
   */
  deleteProperty: (id: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id)
    ),

  /**
   * Get all translations for a property
   */
  getTranslations: (id: string) =>
    api.get<PropertyTranslation[]>(API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id)),

  /**
   * Create or update a translation
   */
  upsertTranslation: (id: string, data: UpsertPropertyTranslationDto) =>
    api.patch<PropertyTranslation>(
      API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id),
      data
    ),

  /**
   * Delete a translation
   */
  deleteTranslation: (id: string, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.TRANSLATION_BY_LANGUAGE(id, language)
    ),

  /**
   * Delete a gallery image
   */
  deleteGalleryImage: (propertyId: string, imageId: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.GALLERY_IMAGE(propertyId, imageId)
    ),
}