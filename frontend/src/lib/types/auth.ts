export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  phone?: string
  role?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface SignInDto {
  email: string
  password: string
}

export interface SignUpDto {
  firstname: string
  lastname: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}
