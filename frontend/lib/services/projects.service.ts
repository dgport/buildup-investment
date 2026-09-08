import { api } from "../api/api";
import type {
  Developer,
  DeveloperInput,
  Lead,
  LeadInput,
  LeadsResponse,
  Project,
  ProjectFilters,
  ProjectImage,
  ProjectInput,
  ProjectMapItem,
  ProjectsResponse,
  UnitType,
  UnitTypeInput,
} from "../types/projects";

const clean = <T extends object>(obj?: T) =>
  obj
    ? Object.fromEntries(
        Object.entries(obj).filter(
          ([, v]) => v !== undefined && v !== null && v !== "",
        ),
      )
    : {};

const imagesForm = (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  return form;
};

export const projectsService = {
  // ─── public ────────────────────────────────────────────────────────────────
  getAll: (filters?: ProjectFilters) =>
    api.get<ProjectsResponse>("/projects", { params: clean(filters) }),
  getMap: (lang?: string) =>
    api.get<ProjectMapItem[]>("/projects/map", { params: clean({ lang }) }),
  getOne: (idOrSlug: string, lang?: string) =>
    api.get<Project>(`/projects/${idOrSlug}`, { params: clean({ lang }) }),
  createLead: (projectId: string, data: LeadInput) =>
    api.post<{ id?: string; message: string }>(`/projects/${projectId}/leads`, data),

  getDevelopers: (lang?: string) =>
    api.get<Developer[]>("/developers", { params: clean({ lang }) }),
  getDeveloper: (idOrSlug: string, lang?: string) =>
    api.get<Developer>(`/developers/${idOrSlug}`, { params: clean({ lang }) }),

  // ─── admin ─────────────────────────────────────────────────────────────────
  adminGetAll: (filters?: ProjectFilters) =>
    api.get<ProjectsResponse>("/projects/admin/all", { params: clean(filters) }),
  adminGetOne: (id: string, lang?: string) =>
    api.get<Project>(`/projects/admin/${id}`, { params: clean({ lang }) }),
  create: (data: ProjectInput) => api.post<Project>("/projects", data),
  update: (id: string, data: ProjectInput) => api.patch<Project>(`/projects/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/projects/${id}`),

  addImages: (id: string, files: File[]) =>
    api.post<ProjectImage[]>(`/projects/${id}/images`, imagesForm(files)),
  reorderImages: (id: string, imageIds: number[]) =>
    api.patch<ProjectImage[]>(`/projects/${id}/images/order`, { imageIds }),
  deleteImage: (id: string, imageId: number) =>
    api.delete<{ message: string }>(`/projects/${id}/images/${imageId}`),

  createUnitType: (projectId: string, data: UnitTypeInput) =>
    api.post<UnitType>(`/projects/${projectId}/unit-types`, data),
  updateUnitType: (projectId: string, unitTypeId: string, data: UnitTypeInput) =>
    api.patch<UnitType>(`/projects/${projectId}/unit-types/${unitTypeId}`, data),
  deleteUnitType: (projectId: string, unitTypeId: string) =>
    api.delete<{ message: string }>(`/projects/${projectId}/unit-types/${unitTypeId}`),
  addUnitTypeImages: (projectId: string, unitTypeId: string, files: File[]) =>
    api.post<ProjectImage[]>(
      `/projects/${projectId}/unit-types/${unitTypeId}/images`,
      imagesForm(files),
    ),
  reorderUnitTypeImages: (projectId: string, unitTypeId: string, imageIds: number[]) =>
    api.patch<ProjectImage[]>(
      `/projects/${projectId}/unit-types/${unitTypeId}/images/order`,
      { imageIds },
    ),

  adminGetDevelopers: (lang?: string) =>
    api.get<Developer[]>("/developers/admin/all", { params: clean({ lang }) }),
  adminGetDeveloper: (id: string) => api.get<Developer>(`/developers/admin/${id}`),
  createDeveloper: (data: DeveloperInput) => api.post<Developer>("/developers", data),
  updateDeveloper: (id: string, data: DeveloperInput) =>
    api.patch<Developer>(`/developers/${id}`, data),
  deleteDeveloper: (id: string) => api.delete<{ message: string }>(`/developers/${id}`),
  setDeveloperLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return api.post<Developer>(`/developers/${id}/logo`, form);
  },
  removeDeveloperLogo: (id: string) =>
    api.delete<{ message: string }>(`/developers/${id}/logo`),

  getLeads: (params?: { page?: number; limit?: number; status?: string; projectId?: string }) =>
    api.get<LeadsResponse>("/projects/leads", { params: clean(params) }),
  updateLead: (id: string, data: { status?: string; note?: string }) =>
    api.patch<Lead>(`/projects/leads/${id}`, data),
  deleteLead: (id: string) => api.delete<{ message: string }>(`/projects/leads/${id}`),
};
