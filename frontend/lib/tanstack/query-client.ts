import { QueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "../constants/cache";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.AUTH.STALE_TIME,
      refetchOnWindowFocus: false,
      retry: CACHE_CONFIG.AUTH.RETRY_COUNT,
      gcTime: CACHE_CONFIG.AUTH.GC_TIME,
    },
  },
});
