export const API_ENDPOINTS = {
  PROPERTIES: {
    PROPERTIES: "/properties",
    MY_PROPERTIES: "/properties/my-properties",
    MY_STATS: "/properties/my-properties/stats",
    PROPERTY_BY_ID: (id: string) => `/properties/${id}`,
    MANAGE: (id: string) => `/properties/${id}/manage`,
    ADMIN_ALL: "/properties/admin/all",
    ADMIN_BY_ID: (id: string) => `/properties/admin/${id}`,
    ADMIN_STATUS: (id: string) => `/properties/admin/${id}/status`,
    TRANSLATIONS: (id: string) => `/properties/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: string, language: string) =>
      `/properties/${id}/translations/${language}`,
    GALLERY_IMAGE: (propertyId: string, imageId: number) =>
      `/properties/${propertyId}/images/${imageId}`,
    GALLERY_ORDER: (propertyId: string) =>
      `/properties/${propertyId}/images/order`,
  },

  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH_TOKEN: "/auth/refresh-token",
    GOOGLE: "/auth/google",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    SETTINGS: "/admin/settings",
  },
} as const;
