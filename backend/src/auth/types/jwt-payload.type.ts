import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  firstname?: string;
  lastname?: string;
  avatar?: string;
}
