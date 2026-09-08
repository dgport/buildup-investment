const TOKEN_KEY = "accessToken";

const isBrowser = () => typeof window !== "undefined";

export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return (
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
};

/** True when the token was stored with "remember me". */
export const isRemembered = (): boolean => {
  if (!isBrowser()) return false;
  try {
    return !!localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
};

export const setAccessToken = (token: string, remember: boolean = false) => {
  if (!isBrowser()) return;
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
      // Non-httpOnly cookie only used by middleware.ts for route protection
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
    }
  } catch {
    // storage unavailable (private mode) – the in-memory query cache still works
  }
  window.dispatchEvent(new Event("auth:login"));
};

export const removeAccessToken = () => {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("auth:logout"));
};

export const isAuthenticated = (): boolean => !!getAccessToken();
