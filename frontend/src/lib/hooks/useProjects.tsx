// hooks/useProjects.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  projectsService,
  type UpsertProjectTranslationDto,
} from '../services/projects.service'
import { queryClient } from '../tanstack/query-client'
import type { Project } from '../types/projects'

export const useProjects = (lang?: string) => {
  return useQuery<Project[]>({
    queryKey: ['projects', lang],
    queryFn: async () => {
      const response = await projectsService.getAll(lang)
      return response.data
    },
  })
}

export const useProject = (id: number, lang?: string) => {
  return useQuery<Project>({
    queryKey: ['projects', id, lang],
    queryFn: async () => {
      const response = await projectsService.getById(id, lang)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateProject = () => {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await projectsService.createProject(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await projectsService.updateProject(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await projectsService.deleteProject(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useDeleteProjectGalleryImage = () => {
  return useMutation({
    mutationFn: async ({
      id,
      imageIndex,
    }: {
      id: number
      imageIndex: number
    }) => {
      const response = await projectsService.deleteGalleryImage(id, imageIndex)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useProjectTranslations = (id: number) => {
  return useQuery({
    queryKey: ['projects', id, 'translations'],
    queryFn: async () => {
      const response = await projectsService.getTranslations(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpsertProjectTranslation = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: UpsertProjectTranslationDto
    }) => {
      const response = await projectsService.upsertTranslation(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useDeleteProjectTranslation = () => {
  return useMutation({
    mutationFn: async ({ id, language }: { id: number; language: string }) => {
      const response = await projectsService.deleteTranslation(id, language)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.id, 'translations'],
      })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
