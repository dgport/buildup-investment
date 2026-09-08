import { useSyncExternalStore } from "react";

/**
 * Reactive `window.matchMedia` without setState-in-effect. Returns
 * `serverValue` during SSR / the first client render.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
