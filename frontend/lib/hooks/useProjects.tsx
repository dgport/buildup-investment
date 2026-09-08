import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "../services/projects.service";
import type {
  DeveloperInput,
  LeadInput,
  ProjectFilters,
  ProjectInput,
  UnitTypeInput,
} from "../types/projects";

export const projectKeys = {
  all: ["projects"] as const,
  list: (filters?: ProjectFilters) => ["projects", "list", filters] as const,
  map: (lang?: string) => ["projects", "map", lang] as const,
  detail: (idOrSlug: string, lang?: string) => ["projects", "detail", idOrSlug, lang] as const,
  adminList: (filters?: ProjectFilters) => ["projects", "admin", "list", filters] as const,
  adminDetail: (id: string) => ["projects", "admin", "detail", id] as const,
  developers: (lang?: string) => ["developers", "list", lang] as const,
  developer: (idOrSlug: string, lang?: string) => ["developers", "detail", idOrSlug, lang] as const,
  adminDevelopers: ["developers", "admin"] as const,
  leads: (params?: object) => ["leads", params] as const,
};

// ─── public ──────────────────────────────────────────────────────────────────

export const useProjects = (filters?: ProjectFilters) =>
  useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => (await projectsService.getAll(filters)).data,
  });

export const useProjectsMap = (lang?: string, enabled = true) =>
  useQuery({
    queryKey: projectKeys.map(lang),
    queryFn: async () => (await projectsService.getMap(lang)).data,
    enabled,
  });

export const useProject = (idOrSlug: string, lang?: string) =>
  useQuery({
    queryKey: projectKeys.detail(idOrSlug, lang),
    queryFn: async () => (await projectsService.getOne(idOrSlug, lang)).data,
    enabled: !!idOrSlug,
    retry: false,
  });

export const useDevelopers = (lang?: string) =>
  useQuery({
    queryKey: projectKeys.developers(lang),
    queryFn: async () => (await projectsService.getDevelopers(lang)).data,
  });

export const useDeveloper = (idOrSlug: string, lang?: string) =>
  useQuery({
    queryKey: projectKeys.developer(idOrSlug, lang),
    queryFn: async () => (await projectsService.getDeveloper(idOrSlug, lang)).data,
    enabled: !!idOrSlug,
    retry: false,
  });

export const useCreateLead = () =>
  useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: LeadInput }) =>
      (await projectsService.createLead(projectId, data)).data,
  });

// ─── admin ───────────────────────────────────────────────────────────────────

const useInvalidateProjects = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: projectKeys.all });
    qc.invalidateQueries({ queryKey: ["developers"] });
  };
};

export const useAdminProjects = (filters?: ProjectFilters) =>
  useQuery({
    queryKey: projectKeys.adminList(filters),
    queryFn: async () => (await projectsService.adminGetAll(filters)).data,
  });

export const useAdminProject = (id: string) =>
  useQuery({
    queryKey: projectKeys.adminDetail(id),
    queryFn: async () => (await projectsService.adminGetOne(id)).data,
    enabled: !!id,
    retry: false,
  });

export const useAdminDevelopers = () =>
  useQuery({
    queryKey: projectKeys.adminDevelopers,
    queryFn: async () => (await projectsService.adminGetDevelopers()).data,
  });

/** useMutation bound to the shared invalidation – a hook, so it must be called unconditionally. */
const useAction = <TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>, onSuccess: () => void) =>
  useMutation({ mutationFn: fn, onSuccess });

export const useProjectMutations = () => {
  const invalidate = useInvalidateProjects();
  const wrap = <TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- called unconditionally, fixed order
    useAction(fn, invalidate);

  return {
    create: wrap((data: ProjectInput) => projectsService.create(data).then((r) => r.data)),
    update: wrap(({ id, data }: { id: string; data: ProjectInput }) =>
      projectsService.update(id, data).then((r) => r.data),
    ),
    remove: wrap((id: string) => projectsService.remove(id).then((r) => r.data)),
    addImages: wrap(({ id, files }: { id: string; files: File[] }) =>
      projectsService.addImages(id, files).then((r) => r.data),
    ),
    reorderImages: wrap(({ id, imageIds }: { id: string; imageIds: number[] }) =>
      projectsService.reorderImages(id, imageIds).then((r) => r.data),
    ),
    deleteImage: wrap(({ id, imageId }: { id: string; imageId: number }) =>
      projectsService.deleteImage(id, imageId).then((r) => r.data),
    ),
    createUnitType: wrap(({ projectId, data }: { projectId: string; data: UnitTypeInput }) =>
      projectsService.createUnitType(projectId, data).then((r) => r.data),
    ),
    updateUnitType: wrap(
      ({ projectId, unitTypeId, data }: { projectId: string; unitTypeId: string; data: UnitTypeInput }) =>
        projectsService.updateUnitType(projectId, unitTypeId, data).then((r) => r.data),
    ),
    deleteUnitType: wrap(({ projectId, unitTypeId }: { projectId: string; unitTypeId: string }) =>
      projectsService.deleteUnitType(projectId, unitTypeId).then((r) => r.data),
    ),
    addUnitTypeImages: wrap(
      ({ projectId, unitTypeId, files }: { projectId: string; unitTypeId: string; files: File[] }) =>
        projectsService.addUnitTypeImages(projectId, unitTypeId, files).then((r) => r.data),
    ),
    reorderUnitTypeImages: wrap(
      ({ projectId, unitTypeId, imageIds }: { projectId: string; unitTypeId: string; imageIds: number[] }) =>
        projectsService.reorderUnitTypeImages(projectId, unitTypeId, imageIds).then((r) => r.data),
    ),
  };
};

export const useDeveloperMutations = () => {
  const invalidate = useInvalidateProjects();
  const wrap = <TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- called unconditionally, fixed order
    useAction(fn, invalidate);

  return {
    create: wrap((data: DeveloperInput) => projectsService.createDeveloper(data).then((r) => r.data)),
    update: wrap(({ id, data }: { id: string; data: DeveloperInput }) =>
      projectsService.updateDeveloper(id, data).then((r) => r.data),
    ),
    remove: wrap((id: string) => projectsService.deleteDeveloper(id).then((r) => r.data)),
    setLogo: wrap(({ id, file }: { id: string; file: File }) =>
      projectsService.setDeveloperLogo(id, file).then((r) => r.data),
    ),
    removeLogo: wrap((id: string) => projectsService.removeDeveloperLogo(id).then((r) => r.data)),
  };
};

export const useLeads = (params?: { page?: number; limit?: number; status?: string; projectId?: string }) =>
  useQuery({
    queryKey: projectKeys.leads(params),
    queryFn: async () => (await projectsService.getLeads(params)).data,
  });

export const useLeadMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["leads"] });
  return {
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: { status?: string; note?: string } }) =>
        projectsService.updateLead(id, data).then((r) => r.data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => projectsService.deleteLead(id).then((r) => r.data),
      onSuccess: invalidate,
    }),
  };
};
