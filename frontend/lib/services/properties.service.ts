import { api } from "../api/api";
import { API_ENDPOINTS } from "../constants/api";

import type {
  PropertiesResponse,
  Property,
  PropertyFilters,
  PropertyGalleryImage,
  PropertyStats,
  PropertyTranslation,
  UpsertPropertyTranslationDto,
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyStatusDto,
} from "../types/properties";

const cleanFilters = (filters?: PropertyFilters) =>
  filters
    ? Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== null && value !== "",
        ),
      )
    : {};

/**
 * Build the multipart body. Booleans are always sent (so unchecking works),
 * `undefined` fields are skipped and `""` is sent as-is (= clear on update).
 */
const buildFormData = (
  data: Partial<CreatePropertyDto>,
  images?: File[],
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === "boolean" ? String(value) : String(value));
  });

  images?.forEach((image) => formData.append("images", image));

  return formData;
};

export const propertiesService = {
  getAll: (filters?: PropertyFilters) =>
    api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.PROPERTIES, {
      params: cleanFilters(filters),
    }),

  getMyProperties: (filters?: PropertyFilters) =>
    api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.MY_PROPERTIES, {
      params: cleanFilters(filters),
    }),

  getMyStats: () => api.get<PropertyStats>(API_ENDPOINTS.PROPERTIES.MY_STATS),

  getAllAdmin: (filters?: PropertyFilters) =>
    api.get<PropertiesResponse>(API_ENDPOINTS.PROPERTIES.ADMIN_ALL, {
      params: cleanFilters(filters),
    }),

  getById: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id), {
      params: lang ? { lang } : {},
    }),

  /** Owner/admin view – works for private or unapproved listings too. */
  getForManage: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.MANAGE(id), {
      params: lang ? { lang } : {},
    }),

  setStatusAdmin: (id: string, data: UpdatePropertyStatusDto) =>
    api.patch<Property>(API_ENDPOINTS.PROPERTIES.ADMIN_STATUS(id), data),

  getByIdAdmin: (id: string, lang?: string) =>
    api.get<Property>(API_ENDPOINTS.PROPERTIES.ADMIN_BY_ID(id), {
      params: lang ? { lang } : {},
    }),

  createProperty: (data: CreatePropertyDto, images?: File[]) =>
    api.post<Property>(
      API_ENDPOINTS.PROPERTIES.PROPERTIES,
      buildFormData(data, images),
    ),

  updateProperty: (id: string, data: UpdatePropertyDto, images?: File[]) =>
    api.patch<Property>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id),
      buildFormData(data, images),
    ),

  deleteProperty: (id: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.PROPERTY_BY_ID(id),
    ),

  getTranslations: (id: string) =>
    api.get<PropertyTranslation[]>(API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id)),

  upsertTranslation: (id: string, data: UpsertPropertyTranslationDto) =>
    api.patch<PropertyTranslation>(
      API_ENDPOINTS.PROPERTIES.TRANSLATIONS(id),
      data,
    ),

  deleteTranslation: (id: string, language: string) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.TRANSLATION_BY_LANGUAGE(id, language),
    ),

  deleteGalleryImage: (propertyId: string, imageId: number) =>
    api.delete<{ message: string }>(
      API_ENDPOINTS.PROPERTIES.GALLERY_IMAGE(propertyId, imageId),
    ),

  reorderGalleryImages: (propertyId: string, imageIds: number[]) =>
    api.patch<PropertyGalleryImage[]>(
      API_ENDPOINTS.PROPERTIES.GALLERY_ORDER(propertyId),
      { imageIds },
    ),
};
