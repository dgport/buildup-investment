// lib/axios.ts
import axios from 'axios'
import { getAccessToken, removeAccessToken } from '../utils/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      removeAccessToken()
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)
