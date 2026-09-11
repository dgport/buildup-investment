import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import type { AdminUser, AdminUsersQuery, UpdateSiteSettings } from "../types/admin";

export const adminKeys = {
  all: ["admin"] as const,
  stats: (lang?: string) => ["admin", "stats", lang] as const,
  users: (query?: AdminUsersQuery) => ["admin", "users", query] as const,
  settings: ["admin", "settings"] as const,
};

export const useAdminStats = (lang?: string) =>
  useQuery({
    queryKey: adminKeys.stats(lang),
    queryFn: async () => (await adminService.getStats(lang)).data,
    staleTime: 30_000,
  });

export const useAdminUsers = (query?: AdminUsersQuery) =>
  useQuery({
    queryKey: adminKeys.users(query),
    queryFn: async () => (await adminService.getUsers(query)).data,
    placeholderData: (prev) => prev,
  });

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { role?: AdminUser["role"]; isActive?: boolean } }) =>
      (await adminService.updateUser(id, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

export const useSiteSettings = () =>
  useQuery({
    queryKey: adminKeys.settings,
    queryFn: async () => (await adminService.getSettings()).data,
  });

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSiteSettings) => (await adminService.updateSettings(data)).data,
    onSuccess: (data) => queryClient.setQueryData(adminKeys.settings, data),
  });
};
