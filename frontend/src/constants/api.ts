export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PARTNERS: {
    PARTNERS: '/partners',
    PARTNER_BY_ID: (id: number) => `/partners/${id}`,
    TRANSLATIONS: (id: number) => `/partners/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/partners/${id}/translations/${language}`,
  },
  PROJECTS: {
    PROJECTS: '/projects',
    PROJECT_BY_ID: (id: number) => `/projects/${id}`,
    PROJECT_GALLERY_IMAGE: (id: number, imageIndex: number) =>
      `/projects/${id}/gallery/${imageIndex}`,
    TRANSLATIONS: (id: number) => `/projects/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/projects/${id}/translations/${language}`,
  },
  APARTMENTS: {
    APARTMENTS: '/apartments',
    APARTMENT_BY_ID: (id: number) => `/apartments/${id}`,
    APARTMENT_IMAGE: (id: number, imageIndex: number) =>
      `/apartments/${id}/images/${imageIndex}`,
    TRANSLATIONS: (id: number) => `/apartments/${id}/translations`,
    TRANSLATION_BY_LANGUAGE: (id: number, language: string) =>
      `/apartments/${id}/translations/${language}`,
  },
} as const
