import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PropertiesResponse,
  Property,
  PropertyFilters,
  PropertyStats,
  PropertyTranslation,
  UpsertPropertyTranslationDto,
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyStatusDto,
} from "../types/properties";
import { propertiesService } from "../services/properties.service";

export const propertyKeys = {
  all: ["properties"] as const,
  public: (filters?: PropertyFilters) =>
    ["properties", "public", filters] as const,
  mine: (filters?: PropertyFilters) =>
    ["properties", "my-properties", filters] as const,
  myStats: ["properties", "my-stats"] as const,
  admin: (filters?: PropertyFilters) =>
    ["properties", "admin", filters] as const,
  detail: (id: string, lang?: string) =>
    ["properties", "detail", id, lang] as const,
  manage: (id: string, lang?: string) =>
    ["properties", "manage", id, lang] as const,
  translations: (id: string) => ["properties", "translations", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Public, approved listings. */
export const useProperties = (filters?: PropertyFilters) =>
  useQuery<PropertiesResponse>({
    queryKey: propertyKeys.public(filters),
    queryFn: async () => (await propertiesService.getAll(filters)).data,
  });

/** The signed-in user's own listings (every status / visibility). */
export const useMyProperties = (filters?: PropertyFilters) =>
  useQuery<PropertiesResponse>({
    queryKey: propertyKeys.mine(filters),
    queryFn: async () => (await propertiesService.getMyProperties(filters)).data,
  });

export const useMyPropertyStats = () =>
  useQuery<PropertyStats>({
    queryKey: propertyKeys.myStats,
    queryFn: async () => (await propertiesService.getMyStats()).data,
  });

/** Admin view – all properties (requires ADMIN role). */
export const usePropertiesAdmin = (filters?: PropertyFilters) =>
  useQuery<PropertiesResponse>({
    queryKey: propertyKeys.admin(filters),
    queryFn: async () => (await propertiesService.getAllAdmin(filters)).data,
    placeholderData: (prev) => prev,
  });

/** Admin moderation: approve / reject / re-queue. */
export const useSetPropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePropertyStatusDto }) =>
      (await propertiesService.setStatusAdmin(id, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
};

/** Public property detail. */
export const useProperty = (id: string, lang?: string) =>
  useQuery<Property>({
    queryKey: propertyKeys.detail(id, lang),
    queryFn: async () => (await propertiesService.getById(id, lang)).data,
    enabled: !!id,
    retry: false,
  });

/** Owner/admin property detail for the edit screens. */
export const usePropertyManage = (id: string, lang?: string) =>
  useQuery<Property>({
    queryKey: propertyKeys.manage(id, lang),
    queryFn: async () => (await propertiesService.getForManage(id, lang)).data,
    enabled: !!id,
    retry: false,
  });

export const usePropertyTranslations = (id: string) =>
  useQuery<PropertyTranslation[]>({
    queryKey: propertyKeys.translations(id),
    queryFn: async () => (await propertiesService.getTranslations(id)).data,
    enabled: !!id,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

const useInvalidateProperty = () => {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ["properties", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["properties", "manage", id] });
      queryClient.invalidateQueries({
        queryKey: propertyKeys.translations(id),
      });
    }
  };
};

export const useCreateProperty = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({
      data,
      images,
    }: {
      data: CreatePropertyDto;
      images?: File[];
    }) => (await propertiesService.createProperty(data, images)).data,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateProperty = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      images,
    }: {
      id: string;
      data: UpdatePropertyDto;
      images?: File[];
    }) => (await propertiesService.updateProperty(id, data, images)).data,
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useDeleteProperty = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async (id: string) =>
      (await propertiesService.deleteProperty(id)).data,
    onSuccess: () => invalidate(),
  });
};

export const useUpsertPropertyTranslation = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpsertPropertyTranslationDto;
    }) => (await propertiesService.upsertTranslation(id, data)).data,
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useDeletePropertyTranslation = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({ id, language }: { id: string; language: string }) =>
      (await propertiesService.deleteTranslation(id, language)).data,
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useDeletePropertyImage = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({
      propertyId,
      imageId,
    }: {
      propertyId: string;
      imageId: number;
    }) => (await propertiesService.deleteGalleryImage(propertyId, imageId)).data,
    onSuccess: (_, variables) => invalidate(variables.propertyId),
  });
};

export const useAddPropertyImages = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({ id, images }: { id: string; images: File[] }) =>
      (await propertiesService.updateProperty(id, {}, images)).data,
    onSuccess: (_, variables) => invalidate(variables.id),
  });
};

export const useReorderPropertyImages = () => {
  const invalidate = useInvalidateProperty();
  return useMutation({
    mutationFn: async ({
      propertyId,
      imageIds,
    }: {
      propertyId: string;
      imageIds: number[];
    }) => (await propertiesService.reorderGalleryImages(propertyId, imageIds)).data,
    onSuccess: (_, variables) => invalidate(variables.propertyId),
  });
};
