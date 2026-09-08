import { api } from "../api/api";
import { API_ENDPOINTS } from "../constants/api";
import { API_BASE_URL } from "../constants/env";

import type {
  User,
  SignInDto,
  SignUpDto,
  AuthResponse,
  RefreshTokenResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../types/auth";

export const authService = {
  signIn: (data: SignInDto) =>
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, data),

  signUp: (data: SignUpDto) =>
    api.post<{ success: boolean; message: string; userId: string }>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data,
    ),

  getCurrentUser: () => api.get<User>(API_ENDPOINTS.AUTH.ME),

  refreshToken: () =>
    api.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {}),

  logout: () => api.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {}),

  googleAuth: () => {
    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      params: { token },
    }),

  resendVerification: (email: string) =>
    api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email,
    }),

  forgotPassword: (data: ForgotPasswordDto) =>
    api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordDto) =>
    api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
};
