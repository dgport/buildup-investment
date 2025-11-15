import type {
  Partner,
  PartnerFilters,
  PartnersResponse,
  PartnerTranslation,
  UpsertTranslationDto,
} from '../types/partners'
import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'

export const partnersService = {
  getAll: (filters?: PartnerFilters) =>
    api.get<PartnersResponse>(API_ENDPOINTS.PARTNERS.PARTNERS, {
      params: filters,
    }),

  getById: (id: number, lang?: string) =>
    api.get<Partner>(API_ENDPOINTS.PARTNERS.PARTNER_BY_ID(id), {
      params: { lang },
    }),

  createPartner: (data: FormData) =>
    api.post<Partner>(API_ENDPOINTS.PARTNERS.PARTNERS, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updatePartner: (id: number, data: FormData) =>
    api.patch<Partner>(API_ENDPOINTS.PARTNERS.PARTNER_BY_ID(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deletePartner: (id: number) =>
    api.delete<{ message: string; id: number }>(
      API_ENDPOINTS.PARTNERS.PARTNER_BY_ID(id)
    ),

  getTranslations: (id: number) =>
    api.get<PartnerTranslation[]>(API_ENDPOINTS.PARTNERS.TRANSLATIONS(id)),

  upsertTranslation: (id: number, data: UpsertTranslationDto) =>
    api.patch<PartnerTranslation>(
      API_ENDPOINTS.PARTNERS.TRANSLATIONS(id),
      data
    ),

  deleteTranslation: (id: number, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PARTNERS.TRANSLATION_BY_LANGUAGE(id, language)
    ),
}
