import axios from 'axios'
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from '../utils/auth'

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  config => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Don't try to refresh token for auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/refresh-token')

    // If 401 and not already retrying and not an auth endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      getAccessToken() // Only try to refresh if we have a token
    ) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          'http://localhost:3000/api/auth/refresh-token',
          {},
          { withCredentials: true }
        )

        const { accessToken } = response.data
        const wasInLocalStorage = !!localStorage.getItem('accessToken')
        setAccessToken(accessToken, wasInLocalStorage)

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        removeAccessToken()
        window.location.href = '/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
