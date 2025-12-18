// hooks/useProperties.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '../tanstack/query-client'
import type {
  PropertiesResponse,
  Property,
  PropertyFilters,
  PropertyTranslation,
  UpsertPropertyTranslationDto,
  CreatePropertyDto,
} from '../types/properties'
import { propertiesService } from '../services/properties.service'

export const useProperties = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const response = await propertiesService.getAll(filters)
      return response.data
    },
  })
}

export const usePropertiesAdmin = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', 'admin', filters],
    queryFn: async () => {
      const response = await propertiesService.getAllAdmin(filters)
      return response.data
    },
  })
}

export const useProperty = (id: string, lang?: string) => {
  return useQuery<Property>({
    queryKey: ['properties', id, lang],
    queryFn: async () => {
      const response = await propertiesService.getById(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

export const usePropertyAdmin = (id: string, lang?: string) => {
  return useQuery<Property>({
    queryKey: ['properties', 'admin', id, lang],
    queryFn: async () => {
      const response = await propertiesService.getByIdAdmin(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateProperty = () => {
  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: CreatePropertyDto
      images?: File[]
    }) => {
      const response = await propertiesService.createProperty(data, images)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export const useUpdateProperty = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: string
      data: Partial<CreatePropertyDto>
      images?: File[]
    }) => {
      const response = await propertiesService.updateProperty(id, data, images)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] })
    },
  })
}

export const useDeleteProperty = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await propertiesService.deleteProperty(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export const usePropertyTranslations = (id: string) => {
  return useQuery<PropertyTranslation[]>({
    queryKey: ['properties', id, 'translations'],
    queryFn: async () => {
      const response = await propertiesService.getTranslations(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpsertPropertyTranslation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpsertPropertyTranslationDto
    }) => {
      const response = await propertiesService.upsertTranslation(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] })
    },
  })
}

export const useDeletePropertyTranslation = () => {
  return useMutation({
    mutationFn: async ({ id, language }: { id: string; language: string }) => {
      const response = await propertiesService.deleteTranslation(id, language)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] })
    },
  })
}

export const useDeletePropertyImage = () => {
  return useMutation({
    mutationFn: async ({
      propertyId,
      imageId,
    }: {
      propertyId: string
      imageId: number
    }) => {
      const response = await propertiesService.deleteGalleryImage(
        propertyId,
        imageId
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.propertyId],
      })
    },
  })
}

export const useAddPropertyImages = () => {
  return useMutation({
    mutationFn: async ({ id, images }: { id: string; images: File[] }) => {
      const response = await propertiesService.updateProperty(id, {}, images)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', variables.id],
      })
    },
  })
}
