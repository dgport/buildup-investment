import type {
  Slide,
  SlideFilters,
  SlidesResponse,
  SlideTranslation,
  UpsertSlideTranslationDto,
} from '../types/slides'
import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'

export const slidesService = {
  getAll: (filters?: SlideFilters) =>
    api.get<SlidesResponse>(API_ENDPOINTS.SLIDES.SLIDES, {
      params: filters,
    }),

  getAllAdmin: (filters?: SlideFilters) =>
    api.get<SlidesResponse>(API_ENDPOINTS.SLIDES.SLIDES_ADMIN, {
      params: filters,
    }),

  getById: (id: number, lang?: string) =>
    api.get<Slide>(API_ENDPOINTS.SLIDES.SLIDE_BY_ID(id), {
      params: { lang },
    }),

  createSlide: (data: FormData) =>
    api.post<Slide>(API_ENDPOINTS.SLIDES.SLIDES, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateSlide: (id: number, data: FormData) =>
    api.patch<Slide>(API_ENDPOINTS.SLIDES.SLIDE_BY_ID(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteSlide: (id: number) =>
    api.delete<{ message: string; id: number }>(
      API_ENDPOINTS.SLIDES.SLIDE_BY_ID(id)
    ),

  getTranslations: (id: number) =>
    api.get<SlideTranslation[]>(API_ENDPOINTS.SLIDES.TRANSLATIONS(id)),

  upsertTranslation: (id: number, data: UpsertSlideTranslationDto) =>
    api.patch<SlideTranslation>(API_ENDPOINTS.SLIDES.TRANSLATIONS(id), data),

  deleteTranslation: (id: number, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.SLIDES.TRANSLATION_BY_LANGUAGE(id, language)
    ),
}
