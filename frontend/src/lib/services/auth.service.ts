import { api } from '../api/api'

export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },
}
