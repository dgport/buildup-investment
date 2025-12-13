import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '../tanstack/query-client'
import type {
  Slide,
  SlideFilters,
  SlidesResponse,
  UpsertSlideTranslationDto,
} from '../types/slides'
import { slidesService } from '../services/slides.service'

export const useSlidesAdmin = (filters?: SlideFilters) => {
  return useQuery<SlidesResponse>({
    queryKey: ['slides', 'admin', filters],
    queryFn: async () => {
      const response = await slidesService.getAllAdmin(filters)

      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          meta: {
            currentPage: filters?.page || 1,
            totalPages: 1,
            totalCount: response.data.length,
            limit: filters?.limit || 5,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      }

      return response.data
    },
  })
}

export const useSlides = (filters?: SlideFilters) => {
  return useQuery({
    queryKey: ['slides', filters],
    queryFn: async () => {
      const response = await slidesService.getAll(filters)

      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          meta: null,
        }
      }

      return response.data
    },
  })
}

export const useSlide = (id: number, lang?: string) => {
  return useQuery<Slide>({
    queryKey: ['slides', id, lang],
    queryFn: async () => {
      const response = await slidesService.getById(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateSlide = () => {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await slidesService.createSlide(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] })
      queryClient.invalidateQueries({ queryKey: ['slides', 'admin'] })
    },
  })
}

export const useUpdateSlide = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await slidesService.updateSlide(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] })
      queryClient.invalidateQueries({ queryKey: ['slides', 'admin'] })
    },
  })
}

export const useDeleteSlide = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await slidesService.deleteSlide(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] })
      queryClient.invalidateQueries({ queryKey: ['slides', 'admin'] })
    },
  })
}

export const useSlideTranslations = (id: number) => {
  return useQuery({
    queryKey: ['slides', id, 'translations'],
    queryFn: async () => {
      const response = await slidesService.getTranslations(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpsertSlideTranslation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: UpsertSlideTranslationDto
    }) => {
      const response = await slidesService.upsertTranslation(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['slides', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['slides'] })
      queryClient.invalidateQueries({ queryKey: ['slides', 'admin'] })
    },
  })
}

export const useDeleteSlideTranslation = () => {
  return useMutation({
    mutationFn: async ({ id, language }: { id: number; language: string }) => {
      const response = await slidesService.deleteTranslation(id, language)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['slides', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['slides'] })
      queryClient.invalidateQueries({ queryKey: ['slides', 'admin'] })
    },
  })
}
