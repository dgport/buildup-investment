import { api } from "../api/api";
import { API_ENDPOINTS } from "../constants/api";
import type {
  AdminStats,
  AdminUser,
  AdminUsersQuery,
  AdminUsersResponse,
  SiteSettings,
  UpdateSiteSettings,
} from "../types/admin";

const clean = (params?: object) =>
  params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
      )
    : {};

export const adminService = {
  getStats: (lang?: string) =>
    api.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS, { params: clean({ lang }) }),

  getUsers: (query?: AdminUsersQuery) =>
    api.get<AdminUsersResponse>(API_ENDPOINTS.ADMIN.USERS, { params: clean(query) }),

  updateUser: (id: string, data: { role?: AdminUser["role"]; isActive?: boolean }) =>
    api.patch<AdminUser>(API_ENDPOINTS.ADMIN.USER_BY_ID(id), data),

  getSettings: () => api.get<SiteSettings>(API_ENDPOINTS.ADMIN.SETTINGS),

  updateSettings: (data: UpdateSiteSettings) =>
    api.patch<SiteSettings>(API_ENDPOINTS.ADMIN.SETTINGS, data),
};
