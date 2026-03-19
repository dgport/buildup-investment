import { api } from "../api/api";
import { API_ENDPOINTS } from "../constants/api";

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
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, data, {
      withCredentials: true,
    }),

  signUp: (data: SignUpDto) =>
    api.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, data),

  getCurrentUser: () =>
    api.get<User>(API_ENDPOINTS.AUTH.ME, {
      withCredentials: true,
    }),

  refreshToken: () =>
    api.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      {
        withCredentials: true,
      },
    ),

  logout: () =>
    api.post<{ message: string }>(
      API_ENDPOINTS.AUTH.LOGOUT,
      {},
      {
        withCredentials: true,
      },
    ),

  googleAuth: () => {
    // Construct full backend URL using the api instance's baseURL
    const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
    window.location.href = `${baseURL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  forgotPassword: (data: ForgotPasswordDto) =>
    api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordDto) =>
    api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
};
