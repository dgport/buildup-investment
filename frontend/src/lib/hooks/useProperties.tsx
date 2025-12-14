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
 

/**
 * Get all properties with filters
 */
export const useProperties = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const response = await propertiesService.getAll(filters)
      return response.data
    },
  })
}

/**
 * Get single property by ID
 */
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

/**
 * Create a new property
 */
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

/**
 * Update an existing property
 */
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

/**
 * Delete a property
 */
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

/**
 * Get all translations for a property
 */
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

/**
 * Create or update a translation
 */
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
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] })
    },
  })
}

/**
 * Delete a translation
 */
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
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties', variables.id] })
    },
  })
}

/**
 * Delete a gallery image
 */
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
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

/**
 * Add images to an existing property
 */
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
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}
