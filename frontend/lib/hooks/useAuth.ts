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
} from "../utils/auth";

// Create a simple store to track token changes
let listeners: (() => void)[] = [];

function emitTokenChange() {
  listeners.forEach((listener) => listener());
}

function subscribeToToken(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getTokenSnapshot() {
  return typeof window !== "undefined" ? !!getAccessToken() : false;
}

function getServerSnapshot() {
  return false;
}

export const useCurrentUser = () => {
  const queryClient = useQueryClient();

  // This will re-render the component when token changes
  const hasToken = useSyncExternalStore(
    subscribeToToken,
    getTokenSnapshot,
    getServerSnapshot,
  );

  return useQuery<User | null>({
    queryKey: ["auth", "currentUser"],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      return response.data;
    },
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
      queryClient.setQueryData(["auth", "currentUser"], data.user);
      emitTokenChange(); // Notify subscribers
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpDto) => {
      const response = await authService.signUp(data);
      return response.data;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authService.logout();
      return response.data;
    },
    onSuccess: () => {
      // 1. Clear the physical token
      removeAccessToken();

      // 2. Notify all subscribers that token changed (this triggers re-renders)
      emitTokenChange();

      // 3. Clear and invalidate queries
      queryClient.setQueryData(["auth", "currentUser"], null);
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authService.refreshToken();
      return response.data;
    },
    onSuccess: (data) => {
      const wasInLocalStorage = !!localStorage.getItem("accessToken");
      setAccessToken(data.accessToken, wasInLocalStorage);
      emitTokenChange();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordDto) => {
      const response = await authService.forgotPassword(data);
      return response.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const response = await authService.resetPassword(data);
      return response.data;
    },
  });
};
