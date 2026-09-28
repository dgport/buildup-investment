/** Only permit navigation within this site, including after an OAuth round trip. */
export function safeAuthNext(value: string | null): string {
  if (!value?.startsWith("/") || /[\\\s]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://buildup.ge");
    return url.origin === "https://buildup.ge"
      ? url.pathname + url.search + url.hash
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export const strongPassword = (value: string) =>
  value.length >= 8 &&
  value.length <= 128 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9\s]/.test(value);

export function authErrorKey(error: unknown): string {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { message?: string | string[]; code?: string };
      };
    }
  )?.response;
  const message = String(response?.data?.message ?? "").toLowerCase();
  if (response?.status === 429) return "tooManyAttempts";
  if (response?.data?.code === "EMAIL_UNAVAILABLE" || response?.status === 503)
    return "emailUnavailable";
  if (response?.status === 409) return "emailExists";
  if (message.includes("inactive")) return "accountInactive";
  if (message.includes("verify your email")) return "notVerified";
  if (message.includes("google")) return "googleOnly";
  if (message.includes("token")) return "linkExpired";
  if (response?.status === 401) return "invalidCredentials";
  if (!response) return "networkError";
  return "genericError";
}
