import { useMutation, useQuery, keepPreviousData } from '@tanstack/react-query'
import { queryClient } from '../tanstack/query-client'
import { apartmentsService } from '../services/apartments.service'
import type {
  Apartment,
  ApartmentsResponse,
  GetApartmentsParams,
  UpsertTranslationDto,
} from '../types/apartments'

// Updated to accept full params object
export const useApartments = (params: GetApartmentsParams = {}) => {
  return useQuery<ApartmentsResponse>({
    // Include params in queryKey so changing page/lang triggers refetch
    queryKey: ['apartments', params],
    queryFn: async () => {
      const response = await apartmentsService.getAll(params)
      return response.data
    },
    // Useful for pagination to prevent UI flashing
    placeholderData: keepPreviousData,
  })
}

export const useApartment = (id: number, lang?: string) => {
  return useQuery<Apartment>({
    queryKey: ['apartments', id, lang],
    queryFn: async () => {
      const response = await apartmentsService.getById(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateApartment = () => {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apartmentsService.createApartment(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export const useUpdateApartment = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apartmentsService.updateApartment(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      // Also invalidate specific apartment details
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id],
      })
    },
  })
}

export const useDeleteApartment = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apartmentsService.deleteApartment(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export const useDeleteApartmentImage = () => {
  return useMutation({
    mutationFn: async ({
      id,
      imageIndex,
    }: {
      id: number
      imageIndex: number
    }) => {
      const response = await apartmentsService.deleteImage(id, imageIndex)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export const useApartmentTranslations = (id: number) => {
  return useQuery({
    queryKey: ['apartments', id, 'translations'],
    queryFn: async () => {
      const response = await apartmentsService.getTranslations(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpsertApartmentTranslation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: UpsertTranslationDto
    }) => {
      const response = await apartmentsService.upsertTranslation(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id, 'translations'],
      })
      // Invalidate specific apartment because the 'description' field might change
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}

export const useDeleteApartmentTranslation = () => {
  return useMutation({
    mutationFn: async ({ id, language }: { id: number; language: string }) => {
      const response = await apartmentsService.deleteTranslation(id, language)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id, 'translations'],
      })
      // Invalidate details as description might fallback to default or change
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })
}
