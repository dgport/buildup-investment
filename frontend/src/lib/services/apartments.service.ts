import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'
import type { Apartment, ApartmentTranslation } from '../types/apartments'

export const apartmentsService = {
  getAll: (lang?: string, projectId?: number) =>
    api.get<Apartment[]>(API_ENDPOINTS.APARTMENTS.APARTMENTS, {
      params: { lang, projectId },
    }),

  getById: (id: number, lang?: string) =>
    api.get<Apartment>(API_ENDPOINTS.APARTMENTS.APARTMENT_BY_ID(id), {
      params: { lang },
    }),

  createApartment: (data: FormData) =>
    api.post<Apartment>(API_ENDPOINTS.APARTMENTS.APARTMENTS, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateApartment: (id: number, data: FormData) =>
    api.patch<Apartment>(API_ENDPOINTS.APARTMENTS.APARTMENT_BY_ID(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteApartment: (id: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.APARTMENTS.APARTMENT_BY_ID(id)
    ),

  deleteImage: (id: number, imageIndex: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.APARTMENTS.APARTMENT_IMAGE(id, imageIndex)
    ),

  getTranslations: (id: number) =>
    api.get<ApartmentTranslation[]>(API_ENDPOINTS.APARTMENTS.TRANSLATIONS(id)),

  upsertTranslation: (id: number, data: ApartmentTranslation) =>
    api.patch<ApartmentTranslation>(
      API_ENDPOINTS.APARTMENTS.TRANSLATIONS(id),
      data
    ),

  deleteTranslation: (id: number, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.APARTMENTS.TRANSLATION_BY_LANGUAGE(id, language)
    ),
}
