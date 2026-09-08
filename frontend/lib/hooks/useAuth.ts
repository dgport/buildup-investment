import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import type {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  User,
} from "../types/auth";
import { authService } from "../services/auth.service";
import {
  setAccessToken,
  removeAccessToken,
  getAccessToken,
  isRemembered,
} from "../utils/auth";

export const authKeys = {
  currentUser: ["auth", "currentUser"] as const,
};

// ─── Token presence store (re-renders consumers when the token changes) ──────

function subscribeToToken(listener: () => void) {
  window.addEventListener("auth:login", listener);
  window.addEventListener("auth:logout", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("auth:login", listener);
    window.removeEventListener("auth:logout", listener);
    window.removeEventListener("storage", listener);
  };
}

const getTokenSnapshot = () => !!getAccessToken();
const getServerSnapshot = () => false;

export const useHasToken = () =>
  useSyncExternalStore(subscribeToToken, getTokenSnapshot, getServerSnapshot);

export const useCurrentUser = () => {
  const hasToken = useHasToken();

  return useQuery<User | null>({
    queryKey: authKeys.currentUser,
    queryFn: async () => (await authService.getCurrentUser()).data,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignInDto & { rememberMe?: boolean }) => {
      const { rememberMe, ...credentials } = data;
      const response = await authService.signIn(credentials);
      return { ...response.data, rememberMe };
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken, data.rememberMe || false);
      queryClient.setQueryData(authKeys.currentUser, data.user);
    },
  });
};

export const useSignUp = () =>
  useMutation({
    mutationFn: async (data: SignUpDto) => (await authService.signUp(data)).data,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => (await authService.logout()).data,
    onSettled: () => {
      // Clear locally even if the server call failed (expired session etc.)
      removeAccessToken();
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["properties", "my-properties"] });
      queryClient.removeQueries({ queryKey: ["properties", "my-stats"] });
      queryClient.removeQueries({ queryKey: ["properties", "manage"] });
    },
  });
};

export const useRefreshToken = () =>
  useMutation({
    mutationFn: async () => (await authService.refreshToken()).data,
    onSuccess: (data) => {
      setAccessToken(data.accessToken, isRemembered());
    },
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (data: ForgotPasswordDto) =>
      (await authService.forgotPassword(data)).data,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: async (data: ResetPasswordDto) =>
      (await authService.resetPassword(data)).data,
  });
