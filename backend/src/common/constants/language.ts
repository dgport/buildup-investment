export const LANGUAGES = ['ka', 'en', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];
