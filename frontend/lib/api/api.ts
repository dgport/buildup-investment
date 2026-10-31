import axios from "axios";
import { API_BASE_URL } from "../constants/env";
import { expiredSessionRedirect } from "../utils/auth-flow";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  isRemembered,
} from "../utils/auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // refresh-token cookie
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// One refresh at a time; concurrent 401s wait for the same promise.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true },
      )
      .then((response) => {
        const { accessToken } = response.data;
        setAccessToken(accessToken, isRemembered());
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/signin") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      getAccessToken()
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        removeAccessToken();
        if (typeof window !== "undefined") {
          const destination = expiredSessionRedirect(window.location.pathname, window.location.search);
          if (destination) window.location.href = destination;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Best-effort human readable message from an axios/Nest error. */
export function getErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  const plain = (error as { message?: string })?.message;
  return plain || fallback;
}
