const TOKEN_KEY = "accessToken";

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token: string, remember: boolean = false) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
  }
  window.dispatchEvent(new Event("auth:login"));
};

export const removeAccessToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event("auth:logout"));
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
