import { UserRole, AuthMethod } from '@prisma/client';

export type { UserRole, AuthMethod };

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  avatar: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  method: AuthMethod;
}
