import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '../tanstack/query-client'
import type {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  User,
} from '../types/auth'
import { authService } from '../services/auth.service'
import {
  setAccessToken,
  removeAccessToken,
  getAccessToken,
} from '../utils/auth'

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      return response.data
    },
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: SignInDto & { rememberMe?: boolean }) => {
      const { rememberMe, ...credentials } = data
      const response = await authService.signIn(credentials)
      return { ...response.data, rememberMe }
    },
    onSuccess: data => {
      setAccessToken(data.accessToken, data.rememberMe || false)
      queryClient.setQueryData(['auth', 'currentUser'], data.user)
    },
  })
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpDto) => {
      const response = await authService.signUp(data)
      return response.data
    },
  })
}

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authService.logout()
      return response.data
    },
    onSuccess: () => {
      removeAccessToken()
      queryClient.setQueryData(['auth', 'currentUser'], null)
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authService.refreshToken()
      return response.data
    },
    onSuccess: data => {
      const wasInLocalStorage = !!localStorage.getItem('accessToken')
      setAccessToken(data.accessToken, wasInLocalStorage)
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordDto) => {
      const response = await authService.forgotPassword(data)
      return response.data
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const response = await authService.resetPassword(data)
      return response.data
    },
  })
}
