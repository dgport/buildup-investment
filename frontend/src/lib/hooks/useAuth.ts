// lib/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
 
import { removeAccessToken, setAccessToken } from '../utils/auth'
import { ROUTES } from '@/constants/routes'
import { api } from '../api/api'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  user: {
    username: string
    role: string
  }
}

export const useAdminLogin = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      return response.data
    },
    onSuccess: data => {
      setAccessToken(data.access_token)
      navigate(ROUTES.HOME) // or '/admin/projects'
    },
    onError: (error: any) => {
      console.error('Login failed:', error)
    },
  })
}

export const useAdminLogout = () => {
  const navigate = useNavigate()

  return () => {
    removeAccessToken()
    navigate(ROUTES.SIGNIN)
  }
}
