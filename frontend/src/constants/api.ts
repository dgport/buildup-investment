export const API_ENDPOINTS = {
  PARTNERS: {
    PARTNERS: '/partners',
    PARTNER_BY_ID: (id: number) => `/partners/${id}`,
    TRANSLATIONS: (id: number) => `/partners/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/partners/${id}/translations/${language}`,
  },

  PROPERTIES: {
    PROPERTIES: '/properties',
    MY_PROPERTIES: '/properties/my-properties', // Add this
    PROPERTY_BY_ID: (id: string) => `/properties/${id}`,
    ADMIN_ALL: '/properties/admin/all', // Add this
    ADMIN_BY_ID: (id: string) => `/properties/admin/${id}`, // Add this
    TRANSLATIONS: (id: string) => `/properties/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: string, language: string) =>
      `/properties/${id}/translations/${language}`,
    GALLERY_IMAGE: (propertyId: string, imageId: number) =>
      `/properties/${propertyId}/images/${imageId}`,
  },

  SLIDES: {
    SLIDES: '/homepage-slides',
    SLIDES_ADMIN: '/homepage-slides/admin',
    SLIDE_BY_ID: (id: number) => `/homepage-slides/${id}`,
    TRANSLATIONS: (id: number) => `/homepage-slides/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/homepage-slides/${id}/translations/${language}`,
  },

  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
    GOOGLE: '/auth/google',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
} as const
