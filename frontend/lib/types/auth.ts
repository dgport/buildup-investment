export type UserRole = "REGULAR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string | null;
  role?: UserRole;
  avatar?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Accepted the current version of the listing terms. */
  listingTermsAccepted?: boolean;
  listingTermsAcceptedAt?: string | null;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user?: User;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}
