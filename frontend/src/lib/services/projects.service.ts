// services/projects.service.ts
import type { Project, ProjectTranslation } from '../types/projects'
import { api } from '../api/api'
import { API_ENDPOINTS } from '@/constants/api'

export interface UpsertProjectTranslationDto {
  language: string
  projectName: string
  projectLocation: string
}

export const projectsService = {
  getAll: (lang?: string) =>
    api.get<Project[]>(API_ENDPOINTS.PROJECTS.PROJECTS, {
      params: { lang },
    }),

  getById: (id: number, lang?: string) =>
    api.get<Project>(API_ENDPOINTS.PROJECTS.PROJECT_BY_ID(id), {
      params: { lang },
    }),

  createProject: (data: FormData) =>
    api.post<Project>(API_ENDPOINTS.PROJECTS.PROJECTS, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateProject: (id: number, data: FormData) =>
    api.patch<Project>(API_ENDPOINTS.PROJECTS.PROJECT_BY_ID(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteProject: (id: number) =>
    api.delete<{ message: string; id: number }>(
      API_ENDPOINTS.PROJECTS.PROJECT_BY_ID(id)
    ),

  deleteGalleryImage: (id: number, imageIndex: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROJECTS.PROJECT_GALLERY_IMAGE(id, imageIndex)
    ),

  getTranslations: (id: number) =>
    api.get<ProjectTranslation[]>(API_ENDPOINTS.PROJECTS.TRANSLATIONS(id)),

  upsertTranslation: (id: number, data: UpsertProjectTranslationDto) =>
    api.patch<ProjectTranslation>(
      API_ENDPOINTS.PROJECTS.TRANSLATIONS(id),
      data
    ),

  deleteTranslation: (id: number, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROJECTS.TRANSLATION_BY_LANGUAGE(id, language)
    ),
}
