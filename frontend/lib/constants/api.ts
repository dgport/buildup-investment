

export const API_ENDPOINTS = {
  PARTNERS: {
    PARTNERS: "/partners",
    PARTNER_BY_ID: (id: number) => `/partners/${id}`,
    TRANSLATIONS: (id: number) => `/partners/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/partners/${id}/translations/${language}`,
  },

  PROPERTIES: {
    PROPERTIES: "/properties",
    MY_PROPERTIES: "/properties/my-properties",
    PROPERTY_BY_ID: (id: string) => `/properties/${id}`,
    ADMIN_ALL: "/properties/admin/all",
    ADMIN_BY_ID: (id: string) => `/properties/admin/${id}`,
    TRANSLATIONS: (id: string) => `/properties/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: string, language: string) =>
      `/properties/${id}/translations/${language}`,
    GALLERY_IMAGE: (propertyId: string, imageId: number) =>
      `/properties/${propertyId}/images/${imageId}`,
  },

  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH_TOKEN: "/auth/refresh-token",
    GOOGLE: "/auth/google",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
} as const;
