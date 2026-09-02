"use client";

import { useEffect } from "react";

/**
 * Refresh the current route whenever the tab regains focus, becomes visible
 * again, or restores from the browser's back/forward cache (bfcache). Also
 * polls every few seconds as a safety net for a backgrounded tab that never
 * loses focus.
 *
 * Why `window.location.reload()` instead of `router.refresh()`:
 * `router.refresh()` revalidates the cache for the current route and merges
 * the new payload into the existing React tree, but it does NOT re-run server
 * components from scratch in all cases — and crucially, when the page is
 * restored from bfcache the React tree is already considered mounted and
 * `router.refresh()` is a no-op. A real navigation rebuilds the tree and forces
 * a fresh fetch from the server, which is what we need for click counts.
 *
 * Mount this once in any subtree that renders server data the user might have
 * updated elsewhere (e.g. by visiting /r/[slug] in another tab and coming
 * back).
 */
const POLL_MS = 5_000;

export function RefreshOnFocus() {
  useEffect(() => {
    let lastReloadAt = 0;
    const reload = () => {
      // Throttle so a flurry of focus/visibility events doesn't loop us.
      const now = Date.now();
      if (now - lastReloadAt < 1_000) return;
      lastReloadAt = now;
      window.location.reload();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") return;
      reload();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reload();
    };
    window.addEventListener("focus", onVisibility);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    // Polling safety net: revalidate periodically so a tab that never lost
    // focus still picks up clicks recorded elsewhere.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, POLL_MS);
    return () => {
      window.removeEventListener("focus", onVisibility);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}