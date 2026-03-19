export const CACHE_CONFIG = {
  AUTH: {
    STALE_TIME: 5 * 60 * 1000,
    GC_TIME: 10 * 60 * 1000,
    RETRY_COUNT: 1,
    RETRY: false,
  },
  PARTICIPANTS: {
    STALE_TIME: 5 * 60 * 1000,
    GC_TIME: 10 * 60 * 1000,
    RETRY_COUNT: 1,
    RETRY: false,
  },
} as const
