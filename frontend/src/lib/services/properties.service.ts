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
  getAll: (filters?: PropertyFilters) => {
    const cleanFilters = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ''
          )
        )
      : {}

    return api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.PROPERTIES, {
      params: cleanFilters,
    })
  },

  getAllAdmin: (filters?: PropertyFilters) => {
    const cleanFilters = filters
      ? Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ''
          )
        )
      : {}

    return api.get<PropertiesResponse>('/properties/admin/all', {
      params: cleanFilters,
    })
  },

  getById: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), {
      params: lang ? { lang } : {},
    }),

  getByIdAdmin: (id: string, lang?: string) =>
    api.get<Property>(`/properties/admin/${id}`, {
      params: lang ? { lang } : {},
    }),

  createProperty: (data: CreatePropertyDto, images?: File[]) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString())
        } else {
          formData.append(key, String(value))
        }
      }
    })

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

  updateProperty: (
    id: string,
    data: Partial<CreatePropertyDto>,
    images?: File[]
  ) => {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString())
        } else {
          formData.append(key, String(value))
        }
      }
    })

    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image)
      })
    }

    return api.patch<Property>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  deleteProperty: (id: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id)
    ),

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

  deleteGalleryImage: (propertyId: string, imageId: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.GALLERY_IMAGE(propertyId, imageId)
    ),
}
