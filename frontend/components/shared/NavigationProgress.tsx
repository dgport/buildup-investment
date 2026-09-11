"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar under the header while a page navigation is in flight.
 * Server-rendered routes can take a moment before their `loading.tsx` shows,
 * so without this a click looks like nothing happened.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Any click on an internal link starts the bar.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setActive(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new route rendered – finish the bar (adjusted during render, so the
  // bar never paints one frame too long).
  const route = `${pathname}?${searchParams}`;
  const [shownRoute, setShownRoute] = useState(route);
  if (shownRoute !== route) {
    setShownRoute(route);
    setActive(false);
  }

  // Never leave it spinning if a navigation is cancelled.
  useEffect(() => {
    if (!active) return;
    timer.current = setTimeout(() => setActive(false), 10000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active]);

  return (
    <div
      aria-hidden
      className={`fixed inset-x-0 top-0 z-[100] h-0.5 pointer-events-none transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] ${
          active ? "animate-[nav-progress_1.4s_ease-out_forwards]" : "w-0"
        }`}
      />
    </div>
  );
}
