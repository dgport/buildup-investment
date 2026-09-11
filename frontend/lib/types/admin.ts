import type { DealType, PropertyType } from "./properties";
import type { LeadStatus, PaginatedMeta } from "./projects";
import type { UserRole } from "./auth";

export interface AdminStats {
  properties: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    draft: number;
    hotSale: number;
  };
  users: { total: number; admins: number; newLast30d: number };
  projects: { total: number; published: number; developers: number };
  leads: { total: number; new: number };
  recentPending: {
    id: string;
    externalId: string;
    propertyType: PropertyType;
    dealType: DealType;
    price: number | null;
    createdAt: string;
    title: string | null;
    coverImage: string | null;
    owner: string | null;
  }[];
  recentLeads: {
    id: number;
    name: string;
    phone: string;
    status: LeadStatus;
    createdAt: string;
    project: { slug: string; title: string };
  }[];
}

export interface AdminUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  role: UserRole;
  method: "CREDENTIALS" | "GOOGLE";
  isVerified: boolean;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
  propertiesCount: number;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta: PaginatedMeta & { counts: Partial<Record<UserRole, number>> };
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export interface SiteSettings {
  default_contact_phone: string | null;
  listing_moderation: "on" | "off";
}

export type UpdateSiteSettings = Partial<SiteSettings>;
