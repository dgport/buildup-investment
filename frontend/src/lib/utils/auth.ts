const TOKEN_KEY = 'admin_token'

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setAccessToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}
