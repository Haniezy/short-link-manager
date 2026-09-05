"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Revalidate the current route's server data when the tab regains focus or
 * becomes visible again. Deliberately no timer and no full reload — a soft
 * `router.refresh()` keeps click counts current without discarding client
 * state, and idle time stays completely quiet.
 *
 * Mount this once in any subtree that renders server data the user might have
 * updated elsewhere (e.g. by visiting /r/[slug] in another tab and coming
 * back).
 */
export function RefreshOnFocus() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastRefreshAt.current < 1000) return;

      lastRefreshAt.current = now;
      router.refresh();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
