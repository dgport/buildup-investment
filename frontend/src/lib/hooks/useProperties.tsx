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

// Public properties (for frontend listing pages)
export const useProperties = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', 'public', filters],
    queryFn: async () => {
      const response = await propertiesService.getAll(filters)
      return response.data
    },
  })
}

// User's own properties (ALWAYS filtered by userId on backend)
export const useMyProperties = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', 'my-properties', filters],
    queryFn: async () => {
      const response = await propertiesService.getMyProperties(filters)
      return response.data
    },
  })
}

// Admin view - all properties (requires ADMIN role)
export const usePropertiesAdmin = (filters?: PropertyFilters) => {
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', 'admin', filters],
    queryFn: async () => {
      const response = await propertiesService.getAllAdmin(filters)
      return response.data
    },
  })
}

// Public property detail
export const useProperty = (id: string, lang?: string) => {
  return useQuery<Property>({
    queryKey: ['properties', 'public', id, lang],
    queryFn: async () => {
      const response = await propertiesService.getById(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

// Admin property detail (includes private properties)
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

// Create property (auto-assigned to current user)
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
      // Invalidate all property-related queries
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

// Update property (ownership checked on backend)
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
      queryClient.invalidateQueries({
        queryKey: ['properties', 'public', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'admin', variables.id],
      })
    },
  })
}

// Delete property (ownership checked on backend)
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

// Property translations (ownership checked on backend)
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

// Upsert translation (ownership checked on backend)
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
      queryClient.invalidateQueries({
        queryKey: ['properties', 'public', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'admin', variables.id],
      })
    },
  })
}

// Delete translation (ownership checked on backend)
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
      queryClient.invalidateQueries({
        queryKey: ['properties', 'public', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'admin', variables.id],
      })
    },
  })
}

// Delete image (ownership checked on backend)
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
        queryKey: ['properties', 'public', variables.propertyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'admin', variables.propertyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'my-properties'],
      })
    },
  })
}

// Add images to property (ownership checked on backend)
export const useAddPropertyImages = () => {
  return useMutation({
    mutationFn: async ({ id, images }: { id: string; images: File[] }) => {
      const response = await propertiesService.updateProperty(id, {}, images)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['properties', 'public', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'admin', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['properties', 'my-properties'],
      })
    },
  })
}
